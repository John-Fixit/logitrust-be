const ApiResponse = require("../../utils/response");
const walletService = require("../../service/walletService");

const getWalletSummary = async (req, res) => {
  try {
    const summary = await walletService.getSummary(req.user.sub);
    return ApiResponse.success(res, summary, "Wallet loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const topUpWallet = async (req, res) => {
  try {
    const summary = await walletService.topUp(req.user.sub, req.body.amount);
    return ApiResponse.success(res, summary, "Wallet funded", 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = { getWalletSummary, topUpWallet };
