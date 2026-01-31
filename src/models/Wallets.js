module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    "Wallet",
    {},
    {
      timeStamps: true,
    },
  );
  return Wallet;
};
