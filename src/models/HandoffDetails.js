"use strict";

module.exports = (sequelize, DataTypes) => {
  const HandoffDetail = sequelize.define(
    "HandoffDetail",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      delivery_id: { type: DataTypes.UUID, allowNull: false },
      driver_name: { type: DataTypes.STRING, allowNull: false },
      driver_phone: { type: DataTypes.STRING, allowNull: false },
      park_name: { type: DataTypes.STRING, allowNull: false },
      vehicle_number: { type: DataTypes.STRING, allowNull: false },
      confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "handoff_details",
      timestamps: false,
      underscored: true,
    },
  );

  HandoffDetail.associate = (models) => {
    HandoffDetail.belongsTo(models.Delivery, {
      foreignKey: "delivery_id",
      as: "delivery",
    });
  };

  return HandoffDetail;
};
