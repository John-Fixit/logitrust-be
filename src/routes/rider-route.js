const router = require("express").Router();
const { requireAuth, requireRoles } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const {
  applyAsRider,
  getMyRiderProfile,
  updateAvailability,
  getAvailableJobs,
  getMyJobs,
  acceptJob,
  updateJobStatus,
  getEarnings,
  verifyRider,
} = require("../controllers/rider/rider.controller");
const {
  applyRiderSchema,
  availabilitySchema,
  jobStatusSchema,
  verifyRiderSchema,
} = require("../validators/rider.validator");

router.use(requireAuth);

router.post("/apply", validateBody(applyRiderSchema), applyAsRider);
router.get("/me", getMyRiderProfile);
router.patch("/me/availability", validateBody(availabilitySchema), updateAvailability);
router.get("/earnings", getEarnings);

router.get("/jobs/available", getAvailableJobs);
router.get("/jobs", getMyJobs);
router.post("/jobs/:trackingCode/accept", acceptJob);
router.patch("/jobs/:trackingCode/status", validateBody(jobStatusSchema), updateJobStatus);

// Admin-only: no dedicated admin UI yet (Phase 4 adds one), but the guarded
// endpoint needs to exist now so riders can actually get verified.
router.patch(
  "/:riderId/verify",
  requireRoles("admin"),
  validateBody(verifyRiderSchema),
  verifyRider,
);

module.exports = router;
