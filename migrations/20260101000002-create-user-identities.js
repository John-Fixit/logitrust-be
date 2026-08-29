"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_identities", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      provider: { type: Sequelize.STRING, allowNull: false },
      provider_user_id: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("user_identities", ["provider", "provider_user_id"], {
      unique: true,
      name: "user_identities_provider_provider_user_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_identities");
  },
};
