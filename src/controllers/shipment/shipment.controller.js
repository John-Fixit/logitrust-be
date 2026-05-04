const ApiResponse = require("../../utils/response");
const shipmentService = require("../../service/shipmentService");

const createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.user.sub, req.body);
    return ApiResponse.success(res, shipment, "Shipment created", 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getMyShipments = async (req, res) => {
  try {
    const shipments = await shipmentService.listMyShipments(req.user.sub);
    return ApiResponse.success(res, shipments, "Shipments loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getShipmentByTrackingCode = async (req, res) => {
  try {
    const shipment = await shipmentService.getByTrackingCode(req.params.trackingCode);
    if (!shipment) return ApiResponse.notFound(res, "Shipment not found");
    return ApiResponse.success(res, shipment, "Shipment loaded");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const shipment = await shipmentService.updateStatus(req.params.trackingCode, req.body);
    if (!shipment) return ApiResponse.notFound(res, "Shipment not found");
    return ApiResponse.success(res, shipment, "Shipment status updated");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createShipment,
  getMyShipments,
  getShipmentByTrackingCode,
  updateShipmentStatus,
};
