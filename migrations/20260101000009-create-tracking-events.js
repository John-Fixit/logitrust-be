"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tracking_events", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "shipments", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      location: { type: Sequelize.STRING, allowNull: false },
      event: { type: Sequelize.STRING, allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tracking_events");
  },
};
