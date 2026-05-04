const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const { createDisputeSchema } = require("../validators/dispute.validator");
const {
  getDisputes,
  createDispute,
} = require("../controllers/dispute/dispute.controller");

router.use(requireAuth);
router.get("/", getDisputes);
router.post("/", validateBody(createDisputeSchema), createDispute);

module.exports = router;
