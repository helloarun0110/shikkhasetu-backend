const volunteerService = require("../services/volunteer.service");
const { successResponse, errorResponse } = require("../utils/response");

const getMyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await volunteerService.getVolunteerRequests(
      req.user.id,
      page,
      limit,
    );
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getAcceptedRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await volunteerService.getVolunteerAcceptedRequests(
      req.user.id,
      page,
      limit,
    );
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await volunteerService.getVolunteerDashboardStats(
      req.user.id,
    );
    return successResponse(res, stats);
  } catch (error) {
    return errorResponse(res, error.message);
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

const getFilteredVolunteers = async (req, res) => {
  try {
    const data = await volunteerService.getFilteredVolunteers(req.query);

    return res.json({
      success: true,
      data: data.data,
      pagination: data.pagination,
    });
  } catch (err) {
    console.error("VOLUNTEER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const addSubject = async (req, res) => {

  console.log(" add sub fetched at controller ");
  try {
    const { subject_names, skill_level = "intermediate" } = req.body;

    await volunteerService.addSubject(
      req.user.id,
      subject_names,
      skill_level
    );

    return successResponse(res, null, "Subjects added", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const addClass = async (req, res) => {
  try {
    const { class_names } = req.body;

    await volunteerService.addClass(req.user.id, class_names);

    return successResponse(res, null, "Classes added", 201);
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

const getFullProfile = async (req, res) => {
  try {

    const profile = await volunteerService.getFullProfile(req.user.id);
    return successResponse(res, profile);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};


const removeClass = async (req, res) => {
  try {
    await volunteerService.removeClass(req.user.id, req.params.class_id);
    return successResponse(res, null, "Class removed");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getVolunteerClasses = async (req, res) => {
  try {
    const data = await volunteerService.getVolunteerClasses(
      req.params.volunteer_id,
    );
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getVolunteerSubjects = async (req, res) => {
  try {
    const data = await volunteerService.getVolunteerSubjects(
      req.params.volunteer_id,
    );
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getVolunteerAvailability = async (req, res) => {
  try {
    const data = await volunteerService.getVolunteerAvailability(
      req.params.volunteer_id,
    );
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const removeSubject = async (req, res) => {
  try {
    await volunteerService.removeSubject(req.user.id, req.params.subject_id);
    return successResponse(res, null, "Subject removed");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const removeAvailability = async (req, res) => {
  try {
    await volunteerService.removeAvailability(
      req.user.id,
      req.params.availability_id,
    );
    return successResponse(res, null, "Availability removed");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateAvailability = async (req, res) => {
  try {
    await volunteerService.updateAvailability(
      req.user.id,
      req.params.availability_id,
      req.body,
    );
    return successResponse(res, null, "Availability updated");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getMyRequests,
  getAcceptedRequests,
  getDashboardStats,
  updateProfile,
  getFilteredVolunteers,
  addSubject,
  addAvailability,
  addClass,
  removeSubject,
  removeAvailability,
  updateAvailability,
  removeClass,
  getFullProfile,
  getVolunteerClasses,
  getVolunteerSubjects,
  getVolunteerAvailability,
};
