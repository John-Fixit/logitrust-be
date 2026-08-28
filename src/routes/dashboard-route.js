const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const {
  getDashboardData,
} = require("../controllers/dashboard/dashboard.controller");

router.get("/", requireAuth, getDashboardData);

module.exports = router;
