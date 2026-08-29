"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("disputes", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "shipments", key: "id" },
      },
      reason: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "open" },
      admin_note: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("disputes");
  },
};
