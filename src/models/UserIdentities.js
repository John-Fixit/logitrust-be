"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserIdentity = sequelize.define(
    "UserIdentity",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "user_identities",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["provider", "provider_user_id"],
        },
      ],
    },
  );

  UserIdentity.associate = (models) => {
    UserIdentity.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return UserIdentity;
};
