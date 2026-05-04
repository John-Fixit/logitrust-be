"use strict";

module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define(
    "WalletTransaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      wallet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "wallet_transactions",
      timestamps: false,
      underscored: true,
    },
  );

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.Wallet, {
      foreignKey: "wallet_id",
      as: "wallet",
    });
  };

  return WalletTransaction;
};
