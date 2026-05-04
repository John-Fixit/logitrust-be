"use strict";

module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define(
    "Delivery",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sender_id: { type: DataTypes.INTEGER, allowNull: false },
      rider_id: { type: DataTypes.INTEGER, allowNull: true },
      driver_id: { type: DataTypes.INTEGER, allowNull: true },
      pickup_address: { type: DataTypes.TEXT, allowNull: false },
      delivery_address: { type: DataTypes.TEXT, allowNull: false },
      state_from: { type: DataTypes.STRING, allowNull: false },
      state_to: { type: DataTypes.STRING, allowNull: false },
      is_interstate: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "deliveries",
      timestamps: false,
      underscored: true,
    },
  );

  Delivery.associate = (models) => {
    Delivery.belongsTo(models.User, { foreignKey: "sender_id", as: "sender" });
    Delivery.belongsTo(models.User, { foreignKey: "rider_id", as: "rider_user" });
    Delivery.belongsTo(models.User, { foreignKey: "driver_id", as: "driver_user" });
    Delivery.hasMany(models.DeliveryPackage, {
      foreignKey: "delivery_id",
      as: "packages",
    });
    Delivery.hasMany(models.DeliveryTracking, {
      foreignKey: "delivery_id",
      as: "tracking_points",
    });
    Delivery.hasOne(models.HandoffDetail, {
      foreignKey: "delivery_id",
      as: "handoff_detail",
    });
    Delivery.hasMany(models.CallLog, {
      foreignKey: "delivery_id",
      as: "call_logs",
    });
    Delivery.hasMany(models.Rating, {
      foreignKey: "delivery_id",
      as: "ratings",
    });
    Delivery.hasMany(models.Dispute, {
      foreignKey: "delivery_id",
      as: "disputes",
    });
  };

  return Delivery;
};
