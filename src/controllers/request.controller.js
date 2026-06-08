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
    await requestService.acceptRequest(req.params.id);
    return successResponse(res, null, "Request accepted");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const rejectRequest = async (req, res) => {
  try {
    await requestService.rejectRequest(req.params.id);
    return successResponse(res, null, "Request rejected");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const cancelRequest = async (req, res) => {
  try {
    await requestService.cancelRequest(req.params.id);
    return successResponse(res, null, "Request cancelled");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  createRequest,
  getRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
};