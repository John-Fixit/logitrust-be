const Joi = require("joi");

const topUpWalletSchema = Joi.object({
  amount: Joi.number().positive().max(10000000).required(),
});

module.exports = { topUpWalletSchema };
