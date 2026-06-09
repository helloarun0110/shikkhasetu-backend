const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // dev এ false রাখো
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);

    res.cookie("token", data.token, cookieOptions);

    return successResponse(res, data, "Registration successful", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);

    res.cookie("token", data.token, cookieOptions); // এটা add করো

    return successResponse(res, data, "Login successful");
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};


const updateUserProfile = async (req, res) => {
  try {
    await authService.updateUserProfile(req.user.id, req.body);
    return successResponse(res, null, "Profile updated");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const updatePassword = async (req, res) => {
  try {
    await authService.updatePassword(req.user.id, req.body);
    return successResponse(res, null, "Password updated");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, "Email is required", 400);
    await authService.forgotPassword(email);
    return successResponse(res, null, "Reset link sent to your email");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) return errorResponse(res, "Token and password required", 400);
    await authService.resetPassword(token, new_password);
    return successResponse(res, null, "Password reset successful");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = { register, login, getMe, updateUserProfile, updatePassword , forgotPassword , resetPassword };



