const ApiResponse = require("../../utils/response");
const disputeService = require("../../service/disputeService");

const getDisputes = async (req, res) => {
  try {
    const disputes = await disputeService.listDisputes();
    return ApiResponse.success(res, disputes, "Disputes loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const createDispute = async (req, res) => {
  try {
    const dispute = await disputeService.createDispute(req.body);
    return ApiResponse.success(res, dispute, "Dispute created", 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  getDisputes,
  createDispute,
};
