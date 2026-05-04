"use strict";

module.exports = (sequelize, DataTypes) => {
  const Rider = sequelize.define(
    "Rider",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      full_name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      vehicle_type: { type: DataTypes.STRING, allowNull: false },
      availability_status: {
        type: DataTypes.STRING,
        defaultValue: "available",
      },
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
      tableName: "riders",
      timestamps: false,
      underscored: true,
    },
  );

  Rider.associate = (models) => {
    Rider.hasMany(models.Shipment, {
      foreignKey: "rider_id",
      as: "shipments",
    });
  };

  return Rider;
};
