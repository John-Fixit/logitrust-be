const Joi = require("joi");

const createDisputeSchema = Joi.object({
  tracking_code: Joi.string().min(1).required(),
  reason: Joi.string().min(5).required(),
});

const resolveDisputeSchema = Joi.object({
  status: Joi.string().valid("under_review", "resolved", "rejected").required(),
  admin_note: Joi.string().allow("").default(""),
});

module.exports = {
  createDisputeSchema,
  resolveDisputeSchema,
};
