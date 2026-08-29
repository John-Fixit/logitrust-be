const ApiResponse = require("../../utils/response");
const adminService = require("../../service/adminService");

const wrap = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    return ApiResponse.success(res, data, "OK");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getOverview = wrap(() => adminService.getOverview());
const getShipments = wrap(() => adminService.listShipments());
const getRiders = wrap((req) => adminService.listRiders(req.query.status));
const getWallets = wrap(() => adminService.listWallets());
const getEscrow = wrap((req) => adminService.listEscrow(req.query.status));
const releaseEscrow = wrap((req) => adminService.releaseEscrow(req.params.trackingCode));
const refundEscrow = wrap((req) => adminService.refundEscrow(req.params.trackingCode));
const getDisputes = wrap(() => adminService.listDisputes());
const resolveDispute = wrap((req) => adminService.resolveDispute(req.params.id, req.body));

module.exports = {
  getOverview,
  getShipments,
  getRiders,
  getWallets,
  getEscrow,
  releaseEscrow,
  refundEscrow,
  getDisputes,
  resolveDispute,
};
