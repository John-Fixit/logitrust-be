const db = require("../models");
const shipmentDao = require("../dao/shipmentDao");
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
  return "Pending";
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
          location: body.pickupAddress,
          event: "Shipment created",
        },
        transaction,
      );

      const escrowAmount = Number(body.value || 0) * 0.03;
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

  async updateStatus(trackingCode, payload) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) return null;

    shipment.status = payload.status;
    await shipment.save();

    await db.sequelize.transaction(async (transaction) => {
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
          location: payload.location || shipment.dropoff_location,
          event: payload.note || `Status updated to ${payload.status}`,
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
        description: `Pickup: ${plain.pickup_location}`,
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
        description: `Drop-off: ${plain.dropoff_location}`,
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
      from: plain.pickup_location,
      to: plain.dropoff_location,
      deliveryType: plain.delivery_type || "standard",
      riderAssigned,
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
