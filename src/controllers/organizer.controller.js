const organizerService = require("../services/organizer.service");
const { successResponse, errorResponse } = require("../utils/response");

const createProfile = async (req, res) => {
  try {
    const data = await organizerService.createProfile({ ...req.body, user_id: req.user.id });
    return successResponse(res, data, "Organizer profile created", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await organizerService.getProfile(req.user.id);
    return successResponse(res, profile);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const getSentRequests = async (req, res) => {
  try {
    const requests = await organizerService.getSentRequests(req.user.id);
    return successResponse(res, requests);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await organizerService.getDashboardStats(req.user.id);
    return successResponse(res, stats);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};


const updateProfile = async (req, res) => {
  try {
    const data = await organizerService.updateProfile(req.user.id, req.body);
    return successResponse(res, null, "profile updated");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};



module.exports = { createProfile, getMyProfile, getSentRequests, getDashboardStats, updateProfile };
