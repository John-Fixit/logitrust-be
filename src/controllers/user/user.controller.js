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
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return ApiResponse.error(res, "User is required", 400);
    const deleted = await userDao.deleteById(userId);
    if (!deleted) return ApiResponse.notFound(res, "User not found");
    return ApiResponse.success(res, null, "User deleted");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};
const deleteMyAccount = async (req, res) => {
  try {
    const tokenUserId = req.user.sub;
    const deleted = await userDao.deleteById(tokenUserId);
    if (!deleted) return ApiResponse.notFound(res, "User not found");
    return ApiResponse.success(res, null, "User deleted");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUserById,
  deleteMyAccount,
};
