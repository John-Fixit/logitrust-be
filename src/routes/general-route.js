const router = require("express").Router();
const generalController = require("../controllers/general.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", requireAuth, upload.single("file"), generalController.uploadFile);

module.exports = router;
