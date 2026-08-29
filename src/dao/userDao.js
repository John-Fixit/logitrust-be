const db = require("../models");

class UserDao {
  async create(data, transaction = null) {
    return db.User.create(data, transaction ? { transaction } : undefined);
  }

  async findById(id) {
    return db.User.findByPk(id, {
      attributes: { exclude: ["password_hash", "verification_token", "verification_token_expires_at"] },
    });
  }

  async findByEmail(email) {
    return db.User.findOne({
      where: { email },
      attributes: { exclude: ["password_hash", "verification_token", "verification_token_expires_at"] },
    });
  }

  async findByEmailWithPassword(email) {
    return db.User.findOne({
      where: { email },
      attributes: [
        "id",
        "full_name",
        "email",
        "phone",
        "role",
        "verification_status",
        "password_hash",
        "created_at",
      ],
    });
  }

  async findByVerificationToken(token) {
    return await db.User.findOne({
      where: { verification_token: token },
    });
  }

  async findByProviderIdentity(provider, providerUserId) {
    return db.UserIdentity.findOne({
      where: {
        provider,
        provider_user_id: providerUserId,
      },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: { exclude: ["password_hash"] },
        },
      ],
    });
  }

  async upsertProviderIdentity({ user_id, provider, provider_user_id, email }) {
    const existing = await db.UserIdentity.findOne({
      where: { provider, provider_user_id },
    });
    if (existing) {
      return existing.update({ user_id, email });
    }
    return db.UserIdentity.create({
      user_id,
      provider,
      provider_user_id,
      email,
    });
  }

  async findAll() {
    return db.User.findAll({
      attributes: { exclude: ["password_hash", "verification_token", "verification_token_expires_at"] },
    });
  }

  async updateById(id, payload) {
    const user = await db.User.findByPk(id);
    if (!user) return null;
    return user.update(payload);
  }

  async deleteById(id) {
    const user = await db.User.findByPk(id);
    if (!user) return 0;
    await user.destroy();
    return 1;
  }
}

module.exports = new UserDao();
