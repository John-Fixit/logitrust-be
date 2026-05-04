const ApiResponse = require("../../utils/response");
const notificationService = require("../../service/notificationService");

const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.sub);
    return ApiResponse.success(res, notifications, "Notifications loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  getNotifications,
};
