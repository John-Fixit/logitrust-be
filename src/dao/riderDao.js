const db = require("../models");

class RiderDao {
  create(payload) {
    return db.Rider.create(payload);
  }

  findByUserId(userId) {
    return db.Rider.findOne({ where: { user_id: userId } });
  }

  findById(id) {
    return db.Rider.findByPk(id);
  }

  /** Admin listing, optionally filtered by verification_status, with linked user info. */
  listAll(status) {
    return db.Rider.findAll({
      where: status ? { verification_status: status } : {},
      include: [{ model: db.User, as: "user", attributes: ["id", "full_name", "email", "phone"] }],
      order: [["created_at", "DESC"]],
    });
  }
}

module.exports = new RiderDao();
