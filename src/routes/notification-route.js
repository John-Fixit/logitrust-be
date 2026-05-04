const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { getNotifications } = require("../controllers/notification/notification.controller");

router.use(requireAuth);
router.get("/", getNotifications);

module.exports = router;
