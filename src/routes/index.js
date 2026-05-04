const express = require("express");
const router = express.Router();
const userRouter = require("./user-route");
const authRouter = require("./auth-route");
const resourcesRouter = require("./resources-route");
const shipmentRouter = require("./shipment-route");
const notificationRouter = require("./notification-route");
const disputeRouter = require("./dispute-route");

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/shipments", shipmentRouter);
router.use("/notifications", notificationRouter);
router.use("/disputes", disputeRouter);
router.use("/resources", resourcesRouter);

module.exports = router;
