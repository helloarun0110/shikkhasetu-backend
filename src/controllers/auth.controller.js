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

module.exports = { register, login, getMe, updateUserProfile, updatePassword };



