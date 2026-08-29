"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("riders", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: { model: "users", key: "id" },
      },
      full_name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      vehicle_type: { type: Sequelize.STRING, allowNull: false },
      availability_status: { type: Sequelize.STRING, allowNull: true, defaultValue: "available" },
      verification_status: { type: Sequelize.STRING, allowNull: true, defaultValue: "pending" },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("riders");
  },
};
