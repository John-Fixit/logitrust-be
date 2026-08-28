const dashboardService = require("../../service/dashboardService");
const ApiResponse = require("../../utils/response");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.sub;
    const dashboardData = await dashboardService.getDashboardUiData(userId);
    return ApiResponse.success(res, dashboardData, "Dashboard data loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  getDashboardData,
};
