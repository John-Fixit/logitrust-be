const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const { getWalletSummary, topUpWallet } = require("../controllers/wallet/wallet.controller");
const { topUpWalletSchema } = require("../validators/wallet.validator");

router.use(requireAuth);

router.get("/", getWalletSummary);
router.post("/topup", validateBody(topUpWalletSchema), topUpWallet);

module.exports = router;
