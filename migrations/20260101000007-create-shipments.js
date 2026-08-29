"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shipments", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      tracking_code: { type: Sequelize.STRING, allowNull: false, unique: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      rider_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "riders", key: "id" },
      },
      interstate_driver_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "interstate_drivers", key: "id" },
      },
      pickup_location: { type: Sequelize.JSON, allowNull: false },
      dropoff_location: { type: Sequelize.JSON, allowNull: false },
      recipient_name: { type: Sequelize.STRING, allowNull: false },
      recipient_phone: { type: Sequelize.STRING, allowNull: false },
      item_description: { type: Sequelize.TEXT, allowNull: true },
      category: { type: Sequelize.STRING, allowNull: true },
      size_tier: { type: Sequelize.STRING, allowNull: true },
      weight: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      item_value: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      package_photo_url: { type: Sequelize.STRING(2048), allowNull: true },
      delivery_type: { type: Sequelize.STRING, allowNull: false },
      payment_status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Escrowed" },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      is_draft: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("shipments");
  },
};
