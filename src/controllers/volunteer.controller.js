const volunteerService = require("../services/volunteer.service");
const { successResponse, errorResponse } = require("../utils/response");

const createProfile = async (req, res) => {
  try {
    const data = await volunteerService.createProfile({ ...req.body, user_id: req.user.id });
    return successResponse(res, data, "Profile created", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await volunteerService.getProfile(req.user.id);
    return successResponse(res, profile);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const updateProfile = async (req, res) => {
  try {
    await volunteerService.updateProfile(req.user.id, req.body);
    return successResponse(res, null, "Profile updated");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getVolunteers = async (req, res) => {
  try {
  
    const volunteers = await volunteerService.getFilteredVolunteers(req.query);
    return successResponse(res, volunteers);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateOpenStatus = async (req, res) => {
  try {
    const { is_open } = req.body;
    if (typeof is_open !== "boolean") {
      return errorResponse(res, "is_open must be a boolean", 400);
    }
    const data = await volunteerService.updateOpenStatus(req.user.id, is_open);
    return successResponse(res, data, `Open status set to ${is_open}`);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const addSubject = async (req, res) => {
  try {
    const { subject_id, skill_level } = req.body;
    await volunteerService.addSubject(req.user.id, subject_id, skill_level);
    return successResponse(res, null, "Subject added", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const addAvailability = async (req, res) => {
  try {
    await volunteerService.addAvailability(req.user.id, req.body);
    return successResponse(res, null, "Availability added", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await volunteerService.getMyRequests(req.user.id);
    return successResponse(res, requests);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  getVolunteers,
  updateOpenStatus,
  addSubject,
  addAvailability,
  getMyRequests,
};
