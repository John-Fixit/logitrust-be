const router = require("express").Router();
const { requireAuth, requireRoles } = require("../middleware/auth.middleware");
const {
  getAllUsers,
  getUserById,
  deleteUserById,
  deleteMyAccount,
} = require("../controllers/user/user.controller");

router.get("/", requireAuth, requireRoles("admin"), getAllUsers);
router.get("/:id", requireAuth, getUserById);
router.delete("/:id", requireAuth, deleteUserById);
router.delete("/my-account", requireAuth, deleteMyAccount);
module.exports = router;
