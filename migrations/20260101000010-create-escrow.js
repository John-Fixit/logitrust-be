"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("escrow", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: "shipments", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "held" },
      released_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("escrow");
  },
};
