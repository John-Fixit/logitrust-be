"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        defaultValue: "customer",
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verification_status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      verification_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verification_token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "users",
      timestamps: false,
      underscored: true,
    },
  );

  User.associate = (models) => {
    User.hasOne(models.Wallet, {
      foreignKey: "user_id",
      as: "wallet",
      onDelete: "CASCADE",
    });
    User.hasMany(models.Shipment, { foreignKey: "user_id", as: "shipments" });
    User.hasMany(models.Payment, { foreignKey: "user_id", as: "payments" });
    User.hasMany(models.Delivery, {
      foreignKey: "sender_id",
      as: "sent_deliveries",
    });
    User.hasMany(models.Rating, {
      foreignKey: "from_user_id",
      as: "ratings_given",
    });
    User.hasMany(models.Rating, {
      foreignKey: "to_user_id",
      as: "ratings_received",
    });
    User.hasMany(models.UserIdentity, {
      foreignKey: "user_id",
      as: "identities",
      onDelete: "CASCADE",
    });
  };

  return User;
};
