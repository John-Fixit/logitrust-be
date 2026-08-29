const Joi = require("joi");

const notificationPreferencesSchema = Joi.object({
  emailEnabled: Joi.boolean().required(),
  pushEnabled: Joi.boolean().required(),
  inAppEnabled: Joi.boolean().required(),
});

module.exports = {
  notificationPreferencesSchema,
};
