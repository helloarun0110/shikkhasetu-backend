const requestService = require("../services/request.service");
const { successResponse, errorResponse } = require("../utils/response");

const createRequest = async (req, res) => {
  try {
    const data = await requestService.createRequest(req.user.id, req.body);
    return successResponse(res, data, "Request sent successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getRequest = async (req, res) => {
  try {
    const request = await requestService.getSingleRequest(req.params.id);
    return successResponse(res, request);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const acceptRequest = async (req, res) => {
  try {
    const data = await requestService.acceptRequest(req.params.id, req.user.id);
    return successResponse(res, data, "Request accepted and session created");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const data = await requestService.rejectRequest(req.params.id, req.user.id);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = { createRequest, getRequest, acceptRequest, rejectRequest };
