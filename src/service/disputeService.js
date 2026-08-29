const db = require("../models");
const shipmentDao = require("../dao/shipmentDao");

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
};

const forbidden = (message) => {
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
};

const shipmentInclude = {
  model: db.Shipment,
  as: "shipment",
  attributes: ["id", "tracking_code", "user_id"],
};

class DisputeService {
  toUiDispute(dispute) {
    const plain = dispute.get ? dispute.get({ plain: true }) : dispute;
    return {
      id: plain.id,
      trackingCode: plain.shipment?.tracking_code || null,
      reason: plain.reason,
      status: plain.status,
      adminNote: plain.admin_note,
      createdAt: plain.created_at,
    };
  }

  async listDisputesForUser(userId) {
    const disputes = await db.Dispute.findAll({
      include: [{ ...shipmentInclude, where: { user_id: userId }, required: true }],
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    return disputes.map((d) => this.toUiDispute(d));
  }

  async listAllDisputes() {
    const disputes = await db.Dispute.findAll({
      include: [shipmentInclude],
      order: [["created_at", "DESC"]],
      limit: 100,
    });
    return disputes.map((d) => this.toUiDispute(d));
  }

  async createDispute(userId, payload) {
    const shipment = await shipmentDao.findByTrackingCode(payload.tracking_code);
    if (!shipment) notFound("Shipment not found");
    if (shipment.user_id !== userId) {
      forbidden("You do not have access to this shipment");
    }

    const dispute = await db.Dispute.create({
      shipment_id: shipment.id,
      reason: payload.reason,
      status: "open",
    });
    return this.toUiDispute(await db.Dispute.findByPk(dispute.id, { include: [shipmentInclude] }));
  }

  async resolveDispute(disputeId, payload) {
    const dispute = await db.Dispute.findByPk(disputeId, { include: [shipmentInclude] });
    if (!dispute) notFound("Dispute not found");

    dispute.status = payload.status;
    if (payload.admin_note) dispute.admin_note = payload.admin_note;
    await dispute.save();

    return this.toUiDispute(dispute);
  }
}

module.exports = new DisputeService();
