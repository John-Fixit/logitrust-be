"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallet_transactions", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "wallets", key: "id" },
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      type: { type: Sequelize.ENUM("credit", "debit"), allowNull: false },
      reference: { type: Sequelize.STRING, allowNull: false, unique: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wallet_transactions");
  },
};
