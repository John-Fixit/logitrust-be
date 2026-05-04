const {
  createAccount,
  loginAccount,
  clerkGoogleExchange,
  me,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/auth/auth");
const { requireAuth } = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validation.middleware");
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  clerkGoogleExchangeSchema,
} = require("../validators/auth.validator");
const authRouter = require("express").Router();

authRouter.post("/register", validateBody(registerSchema), createAccount);
authRouter.post("/login", validateBody(loginSchema), loginAccount);
authRouter.post(
  "/clerk/google",
  validateBody(clerkGoogleExchangeSchema),
  clerkGoogleExchange,
);
authRouter.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);
authRouter.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  resendVerificationEmail,
);
authRouter.get("/me", requireAuth, me);

module.exports = authRouter;
