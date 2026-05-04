const db = require("../models");
const shipmentDao = require("../dao/shipmentDao");

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

class ShipmentService {
  async createShipment(userId, body) {
    const trackingCode = buildTrackingCode();
    const status = "pending";

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
          weight: body.weight,
          item_value: body.value,
          delivery_type: body.deliveryType,
          status,
          payment_status: "Escrowed",
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
    const shipments = await shipmentDao.findByUserId(userId);
    return shipments.map((shipment) => this.toUiShipment(shipment));
  }

  async getByTrackingCode(trackingCode) {
    const shipment = await shipmentDao.findByTrackingCode(trackingCode);
    if (!shipment) return null;
    return this.toUiShipment(shipment);
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

  toUiShipment(shipment) {
    const plain = shipment.get ? shipment.get({ plain: true }) : shipment;
    const value = Number(plain.item_value || 0);
    const fee = Math.round(value * 0.03);

    return {
      trackingId: plain.tracking_code,
      itemDescription: plain.item_description || plain.category || "Package",
      timeline: [
        {
          current: plain.status !== "delivered",
          completed: true,
          title: "Shipment Created",
          description: `Created at ${plain.pickup_location}`,
        },
        {
          current: plain.status === "in_transit",
          completed: plain.status === "in_transit" || plain.status === "delivered",
          title: "In Transit",
          description: "On the way to recipient",
        },
        {
          current: plain.status === "delivered",
          completed: plain.status === "delivered",
          title: "Delivered",
          description: `Delivered to ${plain.dropoff_location}`,
        },
      ],
      photos: [],
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
      rider: {
        avatar: "",
        name: "To be assigned",
      },
      vehicleType: "bike",
      status: normalizeStatusForUi(plain.status),
    };
  }
}

module.exports = new ShipmentService();
