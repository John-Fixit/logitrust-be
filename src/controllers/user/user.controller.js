const ApiResponse = require("../../utils/response");
const userDao = require("../../dao/userDao");

const getAllUsers = async (req, res) => {
  try {
    const users = await userDao.findAll();
    return ApiResponse.success(res, users, "Users loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userDao.findById(req.params.id);
    if (!user) return ApiResponse.notFound(res, "User not found");
    return ApiResponse.success(res, user, "User loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};
