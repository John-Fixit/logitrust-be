"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.STRING, allowNull: true, defaultValue: "customer" },
      password_hash: { type: Sequelize.STRING, allowNull: true },
      verification_status: { type: Sequelize.STRING, allowNull: true, defaultValue: "pending" },
      verification_token: { type: Sequelize.STRING, allowNull: true },
      verification_token_expires_at: { type: Sequelize.DATE, allowNull: true },
      notify_email: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_push: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_in_app: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
