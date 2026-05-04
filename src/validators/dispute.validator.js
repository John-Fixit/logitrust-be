const Joi = require("joi");

const createDisputeSchema = Joi.object({
  delivery_id: Joi.string().min(1).required(),
  reason: Joi.string().min(5).required(),
});

module.exports = {
  createDisputeSchema,
};
