"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("interstate_drivers", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      vehicle_type: { type: Sequelize.STRING, allowNull: false },
      route: { type: Sequelize.STRING, allowNull: false },
      verification_status: { type: Sequelize.STRING, allowNull: true, defaultValue: "pending" },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("interstate_drivers");
  },
};
