"use strict";

module.exports = (sequelize, DataTypes) => {
  const TrackingEvent = sequelize.define(
    "TrackingEvent",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shipment_id: { type: DataTypes.UUID, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      event: { type: DataTypes.STRING, allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "tracking_events",
      timestamps: false,
      underscored: true,
    },
  );

  TrackingEvent.associate = (models) => {
    TrackingEvent.belongsTo(models.Shipment, {
      foreignKey: "shipment_id",
      as: "shipment",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return TrackingEvent;
};
