const sessionService = require("../services/session.service");
const { successResponse, errorResponse } = require("../utils/response");

const createSession = async (req, res) => {
  try {
    console.log(req.body);
    const result = await sessionService.createSession(req.body);
    return successResponse(res, result, "Session created successfully");
  } catch (error) {
    console.error("createSession error:", error);
    return errorResponse(res, error.message, 400);
  }
};

const getMySessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let result;
    if (req.user.role === "volunteer") {
      result = await sessionService.getVolunteerSessions(
        req.user.id,
        page,
        limit,
      );
    } else {
      result = await sessionService.getOrganizerSessions(
        req.user.id,
        page,
        limit,
      );
    }

    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const completeSession = async (req, res) => {
  try {
    await sessionService.completeSession(req.params.id);
    return successResponse(res, null, "Session completed");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const cancelSession = async (req, res) => {
  try {
    await sessionService.cancelSession(req.params.id, req.user.id);
    return successResponse(res, null, "Session cancelled");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getSession = async (req, res) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    return successResponse(res, session);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSession,
  completeSession,
  cancelSession,
};
