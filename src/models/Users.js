module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      full_name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      role: DataTypes.STRING,
      verification_status: DataTypes.BOOLEAN,
      //   created_at
    },
    {
      timeStamps: true,
    },
  );
  return User;
};
