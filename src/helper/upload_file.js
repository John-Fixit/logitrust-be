const cloudinary = require("cloudinary").v2;
const fs = require("fs");

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const err = new Error(
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
    );
    err.statusCode = 503;
    throw err;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a Multer file (memory or disk) to Cloudinary.
 * @param {import("multer").File} file
 * @returns {Promise<string>} secure_url
 */
async function uploadFileHelper(file) {
  if (!file) {
    const e = new Error("No file uploaded");
    e.statusCode = 400;
    throw e;
  }
  configureCloudinary();

  const resourceType = file.mimetype?.startsWith("video/")
    ? "video"
    : file.mimetype?.startsWith("image/")
      ? "image"
      : "auto";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "logitrust-uploads", resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary returned no secure_url"));
        }
        resolve(result.secure_url);
      },
    );

    if (file.buffer) {
      stream.end(file.buffer);
    } else if (file.path) {
      fs.createReadStream(file.path).pipe(stream);
    } else {
      reject(new Error("Multer file has neither buffer nor path"));
    }
  });
}

module.exports = { uploadFileHelper };
