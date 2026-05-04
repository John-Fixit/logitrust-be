"use strict";

module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define(
    "Rating",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      from_user_id: { type: DataTypes.INTEGER, allowNull: false },
      to_user_id: { type: DataTypes.INTEGER, allowNull: false },
      delivery_id: { type: DataTypes.UUID, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      comment: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "ratings",
      timestamps: false,
      underscored: true,
    },
  );

  Rating.associate = (models) => {
    Rating.belongsTo(models.User, {
      foreignKey: "from_user_id",
      as: "from_user",
    });
    Rating.belongsTo(models.User, {
      foreignKey: "to_user_id",
      as: "to_user",
    });
    Rating.belongsTo(models.Delivery, {
      foreignKey: "delivery_id",
      as: "delivery",
    });
  };

  return Rating;
};
