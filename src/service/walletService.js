const db = require("../models");
const shipmentDao = require("../dao/shipmentDao");

const buildWalletReference = (prefix) => {
  const stamp = Date.now().toString().slice(-10);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
};

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
};

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

class WalletService {
  async getWalletForUser(userId, transaction, lock) {
    const wallet = await db.Wallet.findOne({
      where: { user_id: userId },
      transaction,
      lock,
    });
    if (!wallet) notFound("Wallet not found for this user");
    return wallet;
  }

  async getSummary(userId) {
    const wallet = await db.Wallet.findOne({ where: { user_id: userId } });
    const availableBalance = Number(wallet?.balance || 0);

    const heldEscrows = await shipmentDao.findEscrowsForUserShipments(userId, {
      escrowWhere: { status: "held" },
      shipmentWhere: { is_draft: false },
      shipmentAttributes: ["id"],
    });
    const lockedFunds = heldEscrows.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const lockedEscrowCount = heldEscrows.length;
    const headlineTotal = Math.round((lockedFunds + availableBalance) * 100) / 100;

    const transactions = wallet
      ? await db.WalletTransaction.findAll({
          where: { wallet_id: wallet.id },
          order: [["created_at", "DESC"]],
          limit: 50,
        })
      : [];

    return {
      availableBalance: Math.round(availableBalance * 100) / 100,
      lockedFunds: Math.round(lockedFunds * 100) / 100,
      lockedEscrowCount,
      headlineTotal,
      transactions: transactions.map((t) => this.toUiTransaction(t)),
    };
  }

  toUiTransaction(transaction) {
    const plain = transaction.get ? transaction.get({ plain: true }) : transaction;
    return {
      id: plain.id,
      amount: Number(plain.amount),
      type: plain.type,
      reference: plain.reference,
      createdAt: plain.created_at,
    };
  }

  /**
   * Manual top-up. Stands in for a real payment gateway (Paystack/Flutterwave)
   * until Phase 2c wires one up — lets the escrow loop be fully testable now.
   */
  async topUp(userId, amount) {
    if (!(amount > 0)) badRequest("Top-up amount must be greater than zero");

    await db.sequelize.transaction(async (transaction) => {
      const wallet = await this.getWalletForUser(userId, transaction, transaction.LOCK.UPDATE);

      wallet.balance = Number(wallet.balance) + Number(amount);
      await wallet.save({ transaction });

      await db.WalletTransaction.create(
        {
          wallet_id: wallet.id,
          amount: Number(amount).toFixed(2),
          type: "credit",
          reference: buildWalletReference("TOPUP"),
        },
        { transaction },
      );
    });

    // Read after commit — reading inside the transaction callback would see
    // pre-commit state on a separate connection.
    return this.getSummary(userId);
  }

  /**
   * Sender confirms delivery: releases escrow into the assigned rider's wallet.
   * Deliberately a separate, explicit action from the delivery status change
   * itself (per PRD: "funds are released only when you confirm delivery").
   */
  async releaseEscrow(userId, trackingCode) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) notFound("Shipment not found");
    if (shipment.user_id !== userId) {
      const error = new Error("You do not have access to this shipment");
      error.statusCode = 403;
      throw error;
    }
    if (shipment.status !== "delivered") {
      badRequest("Shipment must be marked delivered before releasing escrow");
    }

    await db.sequelize.transaction(async (transaction) => {
      const escrow = await db.Escrow.findOne({
        where: { shipment_id: shipment.id, status: "held" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!escrow) badRequest("No held escrow found for this shipment");

      const rider = shipment.rider_id
        ? await db.Rider.findByPk(shipment.rider_id, { transaction })
        : null;
      if (!rider || !rider.user_id) {
        badRequest(
          "No verified rider is linked to a payout wallet for this shipment yet",
        );
      }

      const riderWallet = await this.getWalletForUser(
        rider.user_id,
        transaction,
        transaction.LOCK.UPDATE,
      );

      riderWallet.balance = Number(riderWallet.balance) + Number(escrow.amount);
      await riderWallet.save({ transaction });

      await db.WalletTransaction.create(
        {
          wallet_id: riderWallet.id,
          amount: Number(escrow.amount).toFixed(2),
          type: "credit",
          reference: buildWalletReference("PAYOUT"),
        },
        { transaction },
      );

      escrow.status = "released";
      escrow.released_at = new Date();
      await escrow.save({ transaction });

      shipment.payment_status = "Released";
      await shipment.save({ transaction });
    });

    return this.getSummary(userId);
  }

  /**
   * Refunds held escrow back to the sender when a shipment is cancelled.
   * Called from shipmentService.updateStatus — no separate confirmation
   * needed since cancellation unambiguously means "give the money back".
   */
  async refundEscrowForCancelledShipment(shipment, transaction) {
    const escrow = await db.Escrow.findOne({
      where: { shipment_id: shipment.id, status: "held" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!escrow) return;

    const wallet = await this.getWalletForUser(
      shipment.user_id,
      transaction,
      transaction.LOCK.UPDATE,
    );

    wallet.balance = Number(wallet.balance) + Number(escrow.amount);
    await wallet.save({ transaction });

    await db.WalletTransaction.create(
      {
        wallet_id: wallet.id,
        amount: Number(escrow.amount).toFixed(2),
        type: "credit",
        reference: buildWalletReference("REFUND"),
      },
      { transaction },
    );

    escrow.status = "refunded";
    escrow.released_at = new Date();
    await escrow.save({ transaction });

    shipment.payment_status = "Refunded";
  }

  // -- admin --

  async listWallets() {
    const wallets = await db.Wallet.findAll({
      include: [{ model: db.User, as: "user", attributes: ["id", "full_name", "email", "role"] }],
      order: [["id", "ASC"]],
    });
    return wallets.map((w) => {
      const plain = w.get({ plain: true });
      return {
        id: plain.id,
        balance: Number(plain.balance),
        user: plain.user
          ? { id: plain.user.id, fullName: plain.user.full_name, email: plain.user.email, role: plain.user.role }
          : null,
      };
    });
  }

  async listEscrow(status) {
    const escrows = await db.Escrow.findAll({
      where: status ? { status } : {},
      include: [
        {
          model: db.Shipment,
          as: "shipment",
          attributes: ["id", "tracking_code", "status", "user_id", "rider_id"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 100,
    });
    return escrows.map((e) => {
      const plain = e.get({ plain: true });
      return {
        id: plain.id,
        amount: Number(plain.amount),
        status: plain.status,
        releasedAt: plain.released_at,
        createdAt: plain.created_at,
        trackingCode: plain.shipment?.tracking_code || null,
        shipmentStatus: plain.shipment?.status || null,
      };
    });
  }

  /** Admin override: force-release held escrow to the assigned rider regardless of who confirms. */
  async adminReleaseEscrow(trackingCode) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) notFound("Shipment not found");
    if (shipment.status !== "delivered") {
      badRequest("Shipment must be marked delivered before releasing escrow");
    }

    await db.sequelize.transaction(async (transaction) => {
      const escrow = await db.Escrow.findOne({
        where: { shipment_id: shipment.id, status: "held" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!escrow) badRequest("No held escrow found for this shipment");

      const rider = shipment.rider_id
        ? await db.Rider.findByPk(shipment.rider_id, { transaction })
        : null;
      if (!rider || !rider.user_id) {
        badRequest("No verified rider is linked to a payout wallet for this shipment yet");
      }

      const riderWallet = await this.getWalletForUser(rider.user_id, transaction, transaction.LOCK.UPDATE);
      riderWallet.balance = Number(riderWallet.balance) + Number(escrow.amount);
      await riderWallet.save({ transaction });

      await db.WalletTransaction.create(
        {
          wallet_id: riderWallet.id,
          amount: Number(escrow.amount).toFixed(2),
          type: "credit",
          reference: buildWalletReference("PAYOUT"),
        },
        { transaction },
      );

      escrow.status = "released";
      escrow.released_at = new Date();
      await escrow.save({ transaction });

      shipment.payment_status = "Released";
      await shipment.save({ transaction });
    });

    return this.listEscrow();
  }

  /** Admin override: force-refund held escrow to the sender (e.g. to resolve a dispute) and cancel the shipment. */
  async adminRefundEscrow(trackingCode) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) notFound("Shipment not found");

    await db.sequelize.transaction(async (transaction) => {
      await this.refundEscrowForCancelledShipment(shipment, transaction);
      shipment.status = "cancelled";
      await shipment.save({ transaction });
      await shipmentDao.addStatusHistory(
        { shipment_id: shipment.id, status: "cancelled", note: "Refunded by admin" },
        transaction,
      );
    });

    return this.listEscrow();
  }
}

module.exports = new WalletService();
