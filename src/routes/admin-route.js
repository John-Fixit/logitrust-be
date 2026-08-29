const router = require("express").Router();
const { requireAuth, requireRoles } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const {
  getOverview,
  getShipments,
  getRiders,
  getWallets,
  getEscrow,
  releaseEscrow,
  refundEscrow,
  getDisputes,
  resolveDispute,
} = require("../controllers/admin/admin.controller");
const { resolveDisputeSchema } = require("../validators/dispute.validator");

router.use(requireAuth, requireRoles("admin"));

router.get("/overview", getOverview);
router.get("/shipments", getShipments);
router.get("/riders", getRiders);
router.get("/wallets", getWallets);
router.get("/escrow", getEscrow);
router.post("/escrow/:trackingCode/release", releaseEscrow);
router.post("/escrow/:trackingCode/refund", refundEscrow);
router.get("/disputes", getDisputes);
router.patch("/disputes/:id", validateBody(resolveDisputeSchema), resolveDispute);

module.exports = router;
