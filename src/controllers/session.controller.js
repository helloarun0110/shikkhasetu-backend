const sessionService = require("../services/session.service");
const { successResponse, errorResponse } = require("../utils/response");

const getMySessions = async (req, res) => {
  try {
    const sessions = await sessionService.getMySessions(req.user.id, req.user.role);
    return successResponse(res, sessions);
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

const completeSession = async (req, res) => {
  try {
    const data = await sessionService.completeSession(req.params.id, req.body.notes);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const cancelSession = async (req, res) => {
  try {
    const data = await sessionService.cancelSession(req.params.id);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = { getMySessions, getSession, completeSession, cancelSession };
