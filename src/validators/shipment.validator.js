const Joi = require("joi");

const createShipmentSchema = Joi.object({
  senderName: Joi.string().min(2).max(120).required(),
  senderPhone: Joi.string().min(7).max(20).required(),
  pickupAddress: Joi.string().min(5).required(),
  recipientName: Joi.string().min(2).max(120).required(),
  recipientPhone: Joi.string().min(7).max(20).required(),
  deliveryAddress: Joi.string().min(5).required(),
  category: Joi.string().required(),
  weight: Joi.number().positive().required(),
  value: Joi.number().min(0).required(),
  description: Joi.string().allow("").default(""),
  deliveryType: Joi.string().valid("standard", "express").required(),
});

const updateShipmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "in_transit", "delivered", "cancelled")
    .required(),
  note: Joi.string().allow("").default(""),
  location: Joi.string().allow("").default(""),
});

module.exports = {
  createShipmentSchema,
  updateShipmentStatusSchema,
};
