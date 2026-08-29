const ApiResponse = require("../../utils/response");
const riderService = require("../../service/riderService");

const applyAsRider = async (req, res) => {
  try {
    const rider = await riderService.apply(req.user.sub, req.body);
    return ApiResponse.success(res, rider, "Rider application submitted", 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getMyRiderProfile = async (req, res) => {
  try {
    const rider = await riderService.getMyProfile(req.user.sub);
    return ApiResponse.success(res, rider, "Rider profile loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const updateAvailability = async (req, res) => {
  try {
    const rider = await riderService.updateAvailability(req.user.sub, req.body.status);
    return ApiResponse.success(res, rider, "Availability updated");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getAvailableJobs = async (req, res) => {
  try {
    const jobs = await riderService.listAvailableJobs(req.user.sub);
    return ApiResponse.success(res, jobs, "Available jobs loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getMyJobs = async (req, res) => {
  try {
    const active = req.query.active === "true";
    const jobs = await riderService.listMyJobs(req.user.sub, { active });
    return ApiResponse.success(res, jobs, "Jobs loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const acceptJob = async (req, res) => {
  try {
    const shipment = await riderService.acceptJob(req.user.sub, req.params.trackingCode);
    return ApiResponse.success(res, shipment, "Job accepted");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const shipment = await riderService.updateJobStatus(
      req.user.sub,
      req.params.trackingCode,
      req.body,
    );
    return ApiResponse.success(res, shipment, "Job status updated");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getEarnings = async (req, res) => {
  try {
    const earnings = await riderService.getEarnings(req.user.sub);
    return ApiResponse.success(res, earnings, "Earnings loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const verifyRider = async (req, res) => {
  try {
    const rider = await riderService.verify(req.params.riderId, req.body.status);
    return ApiResponse.success(res, rider, "Rider verification updated");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  applyAsRider,
  getMyRiderProfile,
  updateAvailability,
  getAvailableJobs,
  getMyJobs,
  acceptJob,
  updateJobStatus,
  getEarnings,
  verifyRider,
};
