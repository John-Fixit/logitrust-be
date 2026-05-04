"use strict";

module.exports = (sequelize, DataTypes) => {
  const ShipmentStatusHistory = sequelize.define(
    "ShipmentStatusHistory",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shipment_id: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "shipment_status_history",
      timestamps: false,
      underscored: true,
    },
  );

  ShipmentStatusHistory.associate = (models) => {
    ShipmentStatusHistory.belongsTo(models.Shipment, {
      foreignKey: "shipment_id",
      as: "shipment",
    });
  };

  return ShipmentStatusHistory;
};
