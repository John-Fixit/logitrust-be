const db = require("../models");
const shipmentDao = require("../dao/shipmentDao");
const walletService = require("./walletService");
const { getRepresentativeWeightKg } = require("../domain/shipment/size-tier");
const { Op } = require("sequelize");

const buildTrackingCode = () => {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LGC-${stamp}-${random}`;
};

const normalizeStatusForUi = (status) => {
  if (status === "in_transit") return "In Transit";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
};

/** Supports legacy string columns and `{ name, lat, long }` JSON. */
const formatLocationLabel = (location) => {
  if (location == null) return "";
  if (typeof location === "string") return location;
  if (typeof location === "object" && location.name != null) {
    return String(location.name);
  }
  return String(location);
};

const normalizeVehicleTypeForUi = (vehicleType) => {
  if (!vehicleType) return null;
  const s = String(vehicleType).toLowerCase();
  if (s.includes("van")) return "van";
  if (s.includes("truck")) return "truck";
  if (s.includes("bike") || s.includes("motor")) return "bike";
  return "bike";
};

class ShipmentService {
  async createShipment(userId, body) {
    const trackingCode = buildTrackingCode();
    const status = "pending";
    const weightKg = getRepresentativeWeightKg(body.sizeTier);
    const packagePhotoUrl =
      typeof body.packagePhotoUrl === "string" && body.packagePhotoUrl.trim()
        ? body.packagePhotoUrl.trim()
        : null;

    const shipment = await db.sequelize.transaction(async (transaction) => {
      const created = await shipmentDao.create(
        {
          tracking_code: trackingCode,
          user_id: userId,
          pickup_location: body.pickupAddress,
          dropoff_location: body.deliveryAddress,
          recipient_name: body.recipientName,
          recipient_phone: body.recipientPhone,
          item_description: body.description,
          category: body.category,
          size_tier: body.sizeTier,
          weight: weightKg,
          item_value: body.value,
          delivery_type: body.deliveryType,
          package_photo_url: packagePhotoUrl,
          status,
          payment_status: "Escrowed",
          is_draft: body.is_draft,
        },
        transaction,
      );

      await shipmentDao.addStatusHistory(
        {
          shipment_id: created.id,
          status,
          note: "Shipment created",
        },
        transaction,
      );

      await shipmentDao.addTrackingEvent(
        {
          shipment_id: created.id,
          location: formatLocationLabel(body.pickupAddress),
          event: "Shipment created",
        },
        transaction,
      );

      const escrowAmount = Number(body.value || 0) * 0.03;

      if (!body.is_draft && escrowAmount > 0) {
        const wallet = await walletService.getWalletForUser(
          userId,
          transaction,
          transaction.LOCK.UPDATE,
        );
        if (Number(wallet.balance) < escrowAmount) {
          const error = new Error(
            "Insufficient wallet balance to fund escrow for this shipment",
          );
          error.statusCode = 400;
          throw error;
        }
        wallet.balance = Number(wallet.balance) - escrowAmount;
        await wallet.save({ transaction });
        await db.WalletTransaction.create(
          {
            wallet_id: wallet.id,
            amount: escrowAmount.toFixed(2),
            type: "debit",
            reference: `ESCROW-${trackingCode}`,
          },
          { transaction },
        );
      }

      await shipmentDao.createEscrow(
        {
          shipment_id: created.id,
          amount: escrowAmount.toFixed(2),
          status: "held",
        },
        transaction,
      );

      return created;
    });

    return this.toUiShipment(shipment);
  }

  async listMyShipments(userId) {
    const shipments = await shipmentDao.findByUserId(userId, {
      where: { is_draft: false },
    });
    return shipments.map((shipment) => this.toUiShipment(shipment));
  }

  async getByTrackingCode(trackingCode) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) return null;
    return this.toUiShipment(shipment);
  }
  async getShipmentById(id) {
    const shipment = await shipmentDao.findById(id);
    if (!shipment) return null;
    return this.toUiShipment(shipment);
  }
  async getRecentShipments(userId) {
    const shipments = await shipmentDao.findByUserId(userId, {
      where: { is_draft: false },
      order: [["created_at", "DESC"]],
      limit: 5,
    });
    return shipments.map((shipment) => this.toUiShipment(shipment));
  }

  async getOngoingShipments(userId) {
    const shipments = await shipmentDao.findByUserId(userId, {
      where: {
        is_draft: false,
        status: { [Op.in]: ["pending", "in_transit"] },
      },
      order: [["created_at", "DESC"]],
      limit: 25,
    });
    return shipments.map((shipment) => this.toUiShipment(shipment));
  }

  /**
   * Most recent non-delivered shipment for progress + header (excludes drafts).
   */
  async getCurrentOrderContext(userId) {
    const rows = await shipmentDao.findByUserId(userId, {
      where: {
        is_draft: false,
        status: { [Op.ne]: "delivered" },
      },
      order: [["created_at", "DESC"]],
      limit: 1,
    });
    if (!rows.length) {
      return {
        timeline: [],
        trackingId: null,
        statusUi: null,
      };
    }
    const s = rows[0];
    const plain = s.get ? s.get({ plain: true }) : s;
    return {
      timeline: this.toTimelineType(s),
      trackingId: plain.tracking_code,
      statusUi: normalizeStatusForUi(plain.status),
    };
  }

  async _writeStatusChange(shipment, payload, transaction) {
    shipment.status = payload.status;
    await shipment.save({ transaction });

    await shipmentDao.addStatusHistory(
      {
        shipment_id: shipment.id,
        status: payload.status,
        note: payload.note || "",
      },
      transaction,
    );

    await shipmentDao.addTrackingEvent(
      {
        shipment_id: shipment.id,
        location: payload.location || formatLocationLabel(shipment.dropoff_location),
        event: payload.note || `Status updated to ${payload.status}`,
      },
      transaction,
    );
  }

  /**
   * Sender-initiated cancellation. Riders progress a shipment through
   * in_transit/delivered via `updateStatusAsRider` instead — this endpoint
   * only ever accepts "cancelled", and only before a rider has picked it up.
   */
  async updateStatus(userId, trackingCode, payload) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) return null;

    if (shipment.user_id !== userId) {
      const error = new Error("You do not have access to this shipment");
      error.statusCode = 403;
      throw error;
    }
    if (payload.status !== "cancelled") {
      const error = new Error(
        "Only cancellation is supported here; delivery progress is updated by the assigned rider",
      );
      error.statusCode = 400;
      throw error;
    }
    if (shipment.status !== "pending" || shipment.rider_id) {
      const error = new Error(
        "Shipment can only be cancelled before a rider has accepted it",
      );
      error.statusCode = 400;
      throw error;
    }

    await db.sequelize.transaction(async (transaction) => {
      await this._writeStatusChange(shipment, payload, transaction);
      await walletService.refundEscrowForCancelledShipment(shipment, transaction);
      await shipment.save({ transaction });
    });

    return this.toUiShipment(shipment);
  }

  /**
   * Rider-initiated progress update. Only the assigned rider may call this,
   * and only in forward order: pending (assigned) -> in_transit -> delivered.
   */
  async updateStatusAsRider(riderId, trackingCode, payload) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) return null;

    if (shipment.rider_id !== riderId) {
      const error = new Error("This job is not assigned to you");
      error.statusCode = 403;
      throw error;
    }

    const nextStatusFor = { pending: "in_transit", in_transit: "delivered" };
    if (nextStatusFor[shipment.status] !== payload.status) {
      const error = new Error(
        `Shipment is currently "${shipment.status}" and cannot move directly to "${payload.status}"`,
      );
      error.statusCode = 400;
      throw error;
    }

    await db.sequelize.transaction(async (transaction) => {
      await this._writeStatusChange(shipment, payload, transaction);
    });

    return this.toUiShipment(shipment);
  }

  async listAvailableJobs() {
    const shipments = await shipmentDao.findAvailableJobs();
    return shipments.map((shipment) => this.toUiShipment(shipment));
  }

  async listJobsForRider(riderId, statusIn) {
    const shipments = await shipmentDao.findJobsForRider(riderId, { statusIn });
    return shipments.map((shipment) => this.toUiShipment(shipment));
  }

  async acceptJob(riderId, trackingCode) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) return null;

    if (shipment.is_draft || shipment.status !== "pending" || shipment.rider_id) {
      const error = new Error("This job is no longer available");
      error.statusCode = 409;
      throw error;
    }

    await db.sequelize.transaction(async (transaction) => {
      shipment.rider_id = riderId;
      await shipment.save({ transaction });

      await shipmentDao.addStatusHistory(
        { shipment_id: shipment.id, status: shipment.status, note: "Rider assigned" },
        transaction,
      );
      await shipmentDao.addTrackingEvent(
        {
          shipment_id: shipment.id,
          location: formatLocationLabel(shipment.pickup_location),
          event: "Rider accepted this delivery",
        },
        transaction,
      );
    });

    return this.toUiShipment(shipment);
  }

  toTimelineType(shipment) {
    const plain = shipment.get ? shipment.get({ plain: true }) : shipment;
    const st = plain.status;
    return [
      {
        current: st === "pending",
        completed: true,
        title: "Shipment Created",
        description: `Pickup: ${formatLocationLabel(plain.pickup_location)}`,
      },
      {
        current: st === "in_transit",
        completed: st === "in_transit" || st === "delivered",
        title: "In Transit",
        description: "On the way to recipient",
      },
      {
        current: st === "delivered",
        completed: st === "delivered",
        title: "Delivered",
        description: `Drop-off: ${formatLocationLabel(plain.dropoff_location)}`,
      },
    ];
  }

  toUiShipment(shipment) {
    const plain = shipment.get ? shipment.get({ plain: true }) : shipment;
    const value = Number(plain.item_value || 0);
    const fee = Math.round(value * 0.03);
    const riderRow = plain.rider || null;
    const riderAssigned = Boolean(plain.rider_id && riderRow);
    const vehicleType = riderAssigned
      ? normalizeVehicleTypeForUi(riderRow.vehicle_type)
      : null;

    return {
      id: plain.id,
      trackingId: plain.tracking_code,
      itemDescription: plain.item_description || plain.category || "Package",
      sizeTier: plain.size_tier || null,
      estimatedWeightKg: plain.weight != null ? Number(plain.weight) : null,
      packagePhotoUrl: plain.package_photo_url || null,
      timeline: this.toTimelineType(shipment),
      photos: plain.package_photo_url ? [plain.package_photo_url] : [],
      payment: plain.payment_status || "Escrowed",
      pricing: {
        deliveryFee: value,
        insurance: 0,
        serviceFee: fee,
        total: value + fee,
      },
      recipient: {
        name: plain.recipient_name,
        phone: plain.recipient_phone,
      },
      from: formatLocationLabel(plain.pickup_location),
      to: formatLocationLabel(plain.dropoff_location),
      deliveryType: plain.delivery_type || "standard",
      riderAssigned,
      pickupLocation: plain.pickup_location,
      dropoffLocation: plain.dropoff_location,
      rider: riderAssigned
        ? {
            avatar: "",
            name: riderRow.full_name,
            phone: riderRow.phone,
          }
        : {
            avatar: "",
            name: "",
            phone: "",
          },
      vehicleType,
      status: normalizeStatusForUi(plain.status),
      createdAt: plain.created_at,
    };
  }
}

module.exports = new ShipmentService();
