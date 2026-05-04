const db = require("../models");

class ShipmentDao {
  create(payload, transaction) {
    return db.Shipment.create(payload, { transaction });
  }

  findByTrackingCode(tracking_code) {
    return db.Shipment.findOne({ where: { tracking_code } });
  }

  findByUserId(userId) {
    return db.Shipment.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });
  }

  addStatusHistory(payload, transaction) {
    return db.ShipmentStatusHistory.create(payload, { transaction });
  }

  addTrackingEvent(payload, transaction) {
    return db.TrackingEvent.create(payload, { transaction });
  }

  createEscrow(payload, transaction) {
    return db.Escrow.create(payload, { transaction });
  }
}

module.exports = new ShipmentDao();
