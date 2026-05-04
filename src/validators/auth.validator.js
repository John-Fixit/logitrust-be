const Joi = require("joi");

const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(20).required(),
  role: Joi.string().valid("customer", "rider", "driver", "admin").default("customer"),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().min(20).required(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const clerkGoogleExchangeSchema = Joi.object({
  clerk_session_token: Joi.string().min(20).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  clerkGoogleExchangeSchema,
};
