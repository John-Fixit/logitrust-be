const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const {
  createShipment,
  getMyShipments,
  getShipmentByTrackingCode,
  updateShipmentStatus,
  releaseShipmentEscrow,
} = require("../controllers/shipment/shipment.controller");
const {
  createShipmentSchema,
  updateShipmentStatusSchema,
} = require("../validators/shipment.validator");

router.use(requireAuth);

router.get("/", getMyShipments);
router.get("/:trackingCode", getShipmentByTrackingCode);
router.post("/", validateBody(createShipmentSchema), createShipment);
router.patch(
  "/:trackingCode/status",
  validateBody(updateShipmentStatusSchema),
  updateShipmentStatus,
);
router.post("/:trackingCode/release", releaseShipmentEscrow);

module.exports = router;
