const userService = require("../../service/userService");
const ApiResponse = require("../../utils/response");

const createAccount = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    return ApiResponse.success(
      res,
      {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          verification_status: user.verification_status,
        },
      },
      "Registered successfully",
      201,
    );
  } catch (err) {
    return ApiResponse.error(res, err.message, err.statusCode || 500);
  }
};

const loginAccount = async (req, res) => {
  try {
    const payload = await userService.loginUser(req.body);
    return ApiResponse.success(res, payload, "Login successful", 200);
  } catch (err) {
    return ApiResponse.error(res, err.message, err.statusCode || 500);
  }
};

const verifyEmail = async (req, res) => {
  console.log(req.body, "req.body");
  try {
    const payload = await userService.verifyEmail(req.body.token);
    return ApiResponse.success(
      res,
      payload,
      "Email verified successfully",
      200,
    );
  } catch (err) {
    return ApiResponse.error(res, err.message, err.statusCode || 500);
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const payload = await userService.resendVerificationEmail(req.body.email);
    const message = payload.already_verified
      ? "Email is already verified"
      : "Verification email sent";
    return ApiResponse.success(res, payload, message, 200);
  } catch (err) {
    return ApiResponse.error(res, err.message, err.statusCode || 500);
  }
};

const clerkGoogleExchange = async (req, res) => {
  try {
    const payload = await userService.exchangeClerkGoogleToken(
      req.body.clerk_session_token,
    );
    return ApiResponse.success(res, payload, "Login successful", 200);
  } catch (err) {
    return ApiResponse.error(res, err.message, err.statusCode || 500);
  }
};

const me = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.sub);
    return ApiResponse.success(
      res,
      {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verification_status: user.verification_status,
          created_at: user.created_at,
        },
      },
      "Profile loaded",
      200,
    );
  } catch (err) {
    return ApiResponse.error(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createAccount,
  loginAccount,
  clerkGoogleExchange,
  verifyEmail,
  resendVerificationEmail,
  me,
};
