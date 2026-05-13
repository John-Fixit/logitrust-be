const Joi = require("joi");
const { SIZE_TIER_IDS } = require("../domain/shipment/size-tier");

const createShipmentSchema = Joi.object({
  senderName: Joi.string().min(2).max(120).required(),
  senderPhone: Joi.string().min(7).max(20).required(),
  pickupAddress: Joi.string().min(5).required(),
  recipientName: Joi.string().min(2).max(120).required(),
  recipientPhone: Joi.string().min(7).max(20).required(),
  deliveryAddress: Joi.string().min(5).required(),
  category: Joi.string().required(),
  sizeTier: Joi.string()
    .valid(...SIZE_TIER_IDS)
    .required()
    .messages({
      "any.only": `sizeTier must be any one of: ${SIZE_TIER_IDS.join(", ")}`,
    }),
  value: Joi.number().min(0).required(),
  description: Joi.string().allow("").default(""),
  deliveryType: Joi.string().valid("standard", "express").required(),
  /** Set after Cloudinary (or other) upload; optional until media pipeline exists */
  packagePhotoUrl: Joi.string().uri().max(2048).allow("").optional(),
  is_draft: Joi.boolean().default(false),
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
