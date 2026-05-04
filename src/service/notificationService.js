const db = require("../models");

class NotificationService {
  async getNotifications(userId) {
    const rows = await db.ShipmentStatusHistory.findAll({
      include: [
        {
          model: db.Shipment,
          as: "shipment",
          where: { user_id: userId },
          required: true,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 30,
    });

    return rows.map((row) => {
      const plain = row.get({ plain: true });
      return {
        id: plain.id,
        title: `Shipment ${plain.shipment.tracking_code} update`,
        message: plain.note || `Status changed to ${plain.status}`,
        status: plain.status,
        createdAt: plain.created_at,
      };
    });
  }
}

module.exports = new NotificationService();
