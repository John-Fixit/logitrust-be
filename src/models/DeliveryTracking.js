"use strict";

module.exports = (sequelize, DataTypes) => {
  const DeliveryTracking = sequelize.define(
    "DeliveryTracking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      delivery_id: { type: DataTypes.UUID, allowNull: false },
      latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
      longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "delivery_tracking",
      timestamps: false,
      underscored: true,
    },
  );

  DeliveryTracking.associate = (models) => {
    DeliveryTracking.belongsTo(models.Delivery, {
      foreignKey: "delivery_id",
      as: "delivery",
    });
  };

  return DeliveryTracking;
};
