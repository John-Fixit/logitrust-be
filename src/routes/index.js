const express = require("express");
const router = express.Router();
const userRouter = require("./user-route");
const authRouter = require("./auth-route");
const resourcesRouter = require("./resources-route");
const shipmentRouter = require("./shipment-route");
const notificationRouter = require("./notification-route");
const disputeRouter = require("./dispute-route");
const generalRouter = require("./general-route");
const dashboardRouter = require("./dashboard-route");
const walletRouter = require("./wallet-route");
const riderRouter = require("./rider-route");
const adminRouter = require("./admin-route");

router.use("/", generalRouter);
router.use("/dashboard", dashboardRouter);
router.use("/wallet", walletRouter);
router.use("/riders", riderRouter);
router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/shipments", shipmentRouter);
router.use("/notifications", notificationRouter);
router.use("/disputes", disputeRouter);
router.use("/resources", resourcesRouter);

module.exports = router;
