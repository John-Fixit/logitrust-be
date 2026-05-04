const db = require("../models");

class DisputeService {
  async listDisputes() {
    return db.Dispute.findAll({
      order: [["created_at", "DESC"]],
      limit: 50,
    });
  }

  async createDispute(payload) {
    return db.Dispute.create({
      delivery_id: payload.delivery_id,
      reason: payload.reason,
      status: "open",
    });
  }
}

module.exports = new DisputeService();
