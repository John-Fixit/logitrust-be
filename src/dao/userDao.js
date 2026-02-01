const db = require("../models");

class UserDao {
  async create(data) {
    return await db.User.create(data);
  }
  async findById(id) {
    return await db.User.findByPk(id);
  }
  async findAll() {
    return await db.User.finAll();
  }
  async DeleteById(id) {
    return await db.User.deleteByPk(id);
  }
}

module.exports = new UserDao();
