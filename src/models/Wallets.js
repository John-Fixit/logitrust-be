"use strict";

module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    "Wallet",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 5000,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "wallets",
      timestamps: false,
      underscored: true,
    },
  );

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    Wallet.hasMany(models.WalletTransaction, {
      foreignKey: "wallet_id",
      as: "transactions",
    });
  };

  return Wallet;
};
