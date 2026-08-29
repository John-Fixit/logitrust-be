const Joi = require("joi");

const applyRiderSchema = Joi.object({
  full_name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().min(7).max(20).required(),
  vehicle_type: Joi.string().valid("bike", "van", "truck").required(),
});

const availabilitySchema = Joi.object({
  status: Joi.string().valid("available", "unavailable").required(),
});

const jobStatusSchema = Joi.object({
  status: Joi.string().valid("in_transit", "delivered").required(),
  note: Joi.string().allow("").default(""),
  location: Joi.string().allow("").default(""),
});

const verifyRiderSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
});

module.exports = {
  applyRiderSchema,
  availabilitySchema,
  jobStatusSchema,
  verifyRiderSchema,
};
