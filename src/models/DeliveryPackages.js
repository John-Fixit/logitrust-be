"use strict";

module.exports = (sequelize, DataTypes) => {
  const DeliveryPackage = sequelize.define(
    "DeliveryPackage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      delivery_id: { type: DataTypes.UUID, allowNull: false },
      photo: { type: DataTypes.TEXT, allowNull: true },
      weight: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "delivery_packages",
      timestamps: false,
      underscored: true,
    },
  );

  DeliveryPackage.associate = (models) => {
    DeliveryPackage.belongsTo(models.Delivery, {
      foreignKey: "delivery_id",
      as: "delivery",
    });
  };

  return DeliveryPackage;
};
