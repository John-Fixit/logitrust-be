const ApiResponse = require("../utils/response");

const buildCrudController = (service, entityLabel = "resource") => ({
  async list(req, res) {
    try {
      const rows = await service.list(req.query || {});
      return ApiResponse.success(res, rows, `${entityLabel} list loaded`);
    } catch (error) {
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  },

  async get(req, res) {
    try {
      const row = await service.get(req.params.id);
      if (!row) return ApiResponse.notFound(res, `${entityLabel} not found`);
      return ApiResponse.success(res, row, `${entityLabel} loaded`);
    } catch (error) {
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  },

  async create(req, res) {
    try {
      const row = await service.create(req.body);
      return ApiResponse.success(res, row, `${entityLabel} created`, 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  },

  async update(req, res) {
    try {
      const row = await service.update(req.params.id, req.body);
      if (!row) return ApiResponse.notFound(res, `${entityLabel} not found`);
      return ApiResponse.success(res, row, `${entityLabel} updated`);
    } catch (error) {
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await service.remove(req.params.id);
      if (!deleted) return ApiResponse.notFound(res, `${entityLabel} not found`);
      return ApiResponse.success(res, null, `${entityLabel} deleted`);
    } catch (error) {
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  },
});

module.exports = { buildCrudController };
