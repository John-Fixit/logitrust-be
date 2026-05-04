"use strict";

module.exports = (sequelize, DataTypes) => {
  const CallLog = sequelize.define(
    "CallLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      delivery_id: { type: DataTypes.UUID, allowNull: false },
      phone_called: { type: DataTypes.STRING, allowNull: false },
      call_status: { type: DataTypes.STRING, allowNull: false },
      recording_url: { type: DataTypes.TEXT, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "call_logs",
      timestamps: false,
      underscored: true,
    },
  );

  CallLog.associate = (models) => {
    CallLog.belongsTo(models.Delivery, {
      foreignKey: "delivery_id",
      as: "delivery",
    });
  };

  return CallLog;
};
