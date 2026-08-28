"use strict";

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define(
    "Shipment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tracking_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rider_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      interstate_driver_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      /** `{ name, lat, long }` — use JSON (MySQL); not JSONB (PostgreSQL-only). */
      pickup_location: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      dropoff_location: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      recipient_name: { type: DataTypes.STRING, allowNull: false },
      recipient_phone: { type: DataTypes.STRING, allowNull: false },
      item_description: { type: DataTypes.TEXT, allowNull: true },
      category: { type: DataTypes.STRING, allowNull: true },
      size_tier: {
        type: DataTypes.STRING,
        allowNull: true,
        comment:
          "Customer-selected package tier (see domain/shipment/size-tier.js)",
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Representative kg derived from size_tier at creation",
      },
      item_value: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      package_photo_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
      delivery_type: { type: DataTypes.STRING, allowNull: false },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Escrowed",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      is_draft: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "shipments",
      timestamps: false,
      underscored: true,
    },
  );

  Shipment.associate = (models) => {
    Shipment.belongsTo(models.User, { foreignKey: "user_id", as: "sender" });
    Shipment.belongsTo(models.Rider, { foreignKey: "rider_id", as: "rider" });
    Shipment.belongsTo(models.InterstateDriver, {
      foreignKey: "interstate_driver_id",
      as: "interstate_driver",
    });
    Shipment.hasMany(models.ShipmentStatusHistory, {
      foreignKey: "shipment_id",
      as: "status_history",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Shipment.hasMany(models.TrackingEvent, {
      foreignKey: "shipment_id",
      as: "tracking_events",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Shipment.hasOne(models.Escrow, {
      foreignKey: "shipment_id",
      as: "escrow",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Shipment;
};
