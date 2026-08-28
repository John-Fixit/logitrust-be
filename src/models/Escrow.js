"use strict";

module.exports = (sequelize, DataTypes) => {
  const Escrow = sequelize.define(
    "Escrow",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shipment_id: { type: DataTypes.UUID, allowNull: false, unique: true },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "held" },
      released_at: { type: DataTypes.DATE, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "escrow",
      timestamps: false,
      underscored: true,
    },
  );

  Escrow.associate = (models) => {
    Escrow.belongsTo(models.Shipment, {
      foreignKey: "shipment_id",
      as: "shipment",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Escrow;
};
