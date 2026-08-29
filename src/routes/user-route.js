const router = require("express").Router();
const { requireAuth, requireRoles } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const {
  getAllUsers,
  getUserById,
  deleteUserById,
  deleteMyAccount,
  getNotificationPreferences,
  updateNotificationPreferences,
} = require("../controllers/user/user.controller");
const { notificationPreferencesSchema } = require("../validators/user.validator");

router.get("/", requireAuth, requireRoles("admin"), getAllUsers);
router.get("/me/notification-preferences", requireAuth, getNotificationPreferences);
router.patch(
  "/me/notification-preferences",
  requireAuth,
  validateBody(notificationPreferencesSchema),
  updateNotificationPreferences,
);
router.delete("/my-account", requireAuth, deleteMyAccount);
router.get("/:id", requireAuth, getUserById);
router.delete("/:id", requireAuth, deleteUserById);
module.exports = router;
