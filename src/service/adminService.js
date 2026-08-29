const db = require("../models");
const shipmentDao = require("../dao/shipmentDao");
const riderDao = require("../dao/riderDao");
const shipmentService = require("./shipmentService");
const walletService = require("./walletService");
const disputeService = require("./disputeService");

class AdminService {
  async getOverview() {
    const [
      totalUsers,
      totalRiders,
      pendingRiders,
      approvedRiders,
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      cancelledShipments,
      heldEscrow,
      releasedEscrow,
      openDisputes,
      wallets,
    ] = await Promise.all([
      db.User.count(),
      db.Rider.count(),
      db.Rider.count({ where: { verification_status: "pending" } }),
      db.Rider.count({ where: { verification_status: "approved" } }),
      db.Shipment.count({ where: { is_draft: false } }),
      db.Shipment.count({ where: { is_draft: false, status: "pending" } }),
      db.Shipment.count({ where: { is_draft: false, status: "in_transit" } }),
      db.Shipment.count({ where: { is_draft: false, status: "delivered" } }),
      db.Shipment.count({ where: { is_draft: false, status: "cancelled" } }),
      db.Escrow.sum("amount", { where: { status: "held" } }),
      db.Escrow.sum("amount", { where: { status: "released" } }),
      db.Dispute.count({ where: { status: ["open", "under_review"] } }),
      db.Wallet.sum("balance"),
    ]);

    return {
      users: { total: totalUsers },
      riders: { total: totalRiders, pending: pendingRiders, approved: approvedRiders },
      shipments: {
        total: totalShipments,
        pending: pendingShipments,
        inTransit: inTransitShipments,
        delivered: deliveredShipments,
        cancelled: cancelledShipments,
      },
      escrow: {
        held: Math.round((heldEscrow || 0) * 100) / 100,
        released: Math.round((releasedEscrow || 0) * 100) / 100,
      },
      wallets: { totalBalance: Math.round((wallets || 0) * 100) / 100 },
      disputes: { open: openDisputes },
    };
  }

  async listShipments() {
    const shipments = await shipmentDao.listAll();
    return shipments.map((s) => shipmentService.toUiShipment(s));
  }

  async listRiders(status) {
    const riders = await riderDao.listAll(status);
    return riders.map((r) => {
      const plain = r.get({ plain: true });
      return {
        id: plain.id,
        fullName: plain.full_name,
        phone: plain.phone,
        vehicleType: plain.vehicle_type,
        availabilityStatus: plain.availability_status,
        verificationStatus: plain.verification_status,
        createdAt: plain.created_at,
        user: plain.user
          ? { id: plain.user.id, fullName: plain.user.full_name, email: plain.user.email }
          : null,
      };
    });
  }

  listWallets() {
    return walletService.listWallets();
  }

  listEscrow(status) {
    return walletService.listEscrow(status);
  }

  releaseEscrow(trackingCode) {
    return walletService.adminReleaseEscrow(trackingCode);
  }

  refundEscrow(trackingCode) {
    return walletService.adminRefundEscrow(trackingCode);
  }

  listDisputes() {
    return disputeService.listAllDisputes();
  }

  resolveDispute(disputeId, payload) {
    return disputeService.resolveDispute(disputeId, payload);
  }
}

module.exports = new AdminService();
