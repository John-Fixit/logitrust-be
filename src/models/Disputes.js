"use strict";

module.exports = (sequelize, DataTypes) => {
  const Dispute = sequelize.define(
    "Dispute",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shipment_id: { type: DataTypes.UUID, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "open" },
      admin_note: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "disputes",
      timestamps: false,
      underscored: true,
    },
  );

  Dispute.associate = (models) => {
    Dispute.belongsTo(models.Shipment, {
      foreignKey: "shipment_id",
      as: "shipment",
    });
  };

  return Dispute;
};
