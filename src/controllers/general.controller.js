const { uploadFileHelper } = require("../helper/upload_file");
const ApiResponse = require("../utils/response");

module.exports = generalController = {
  async uploadFile(req, res) {
    try {
      const file = req.file;
      const url = await uploadFileHelper(file);
      return ApiResponse.success(res, url, "File uploaded successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  },
};
