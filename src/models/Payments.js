"use strict";

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      method: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
      reference: { type: DataTypes.STRING, allowNull: false, unique: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "payments",
      timestamps: false,
      underscored: true,
    },
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Payment;
};
