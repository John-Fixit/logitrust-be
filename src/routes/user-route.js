const router = require("express").Router();
const { requireAuth, requireRoles } = require("../middleware/auth.middleware");
const {
  getAllUsers,
  getUserById,
} = require("../controllers/user/user.controller");

router.get("/", requireAuth, requireRoles("admin"), getAllUsers);
router.get("/:id", requireAuth, getUserById);

module.exports = router;
