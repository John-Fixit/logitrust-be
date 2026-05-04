"use strict";

module.exports = (sequelize, DataTypes) => {
  const InterstateDriver = sequelize.define(
    "InterstateDriver",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      full_name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      vehicle_type: { type: DataTypes.STRING, allowNull: false },
      route: { type: DataTypes.STRING, allowNull: false },
      verification_status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "interstate_drivers",
      timestamps: false,
      underscored: true,
    },
  );

  InterstateDriver.associate = (models) => {
    InterstateDriver.hasMany(models.Shipment, {
      foreignKey: "interstate_driver_id",
      as: "shipments",
    });
  };

  return InterstateDriver;
};
