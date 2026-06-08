const pool = require("../config/db");
const requestQuery = require("../queries/request.query");
const organizerQuery = require("../queries/organizer.query");
const volunteerQuery = require("../queries/volunteer.query");
const { createNotification } = require("../utils/notification.helper");

// CREATE REQUEST
const createRequest = async (userId, data) => {
  const organizer = await organizerQuery.getProfileByUserId(userId);
  if (!organizer) throw new Error("Organizer profile not found");

  console.log("volunteer_profile_id =", data.volunteer_profile_id);

  const [volunteerRow] = await pool.execute(
    `SELECT vp.id, vp.user_id
     FROM volunteer_profiles vp
     JOIN users u ON vp.user_id = u.id
     WHERE vp.id = ?
     AND u.is_active = TRUE`,
    [data.volunteer_profile_id]
  );

  console.log(volunteerRow);

  if (!volunteerRow[0]) {
    throw new Error("Volunteer not available");
  }

  const expires_at =
    data.expires_at ||
    new Date(Date.now() + 48 * 60 * 60 * 1000);
  
  const result = await requestQuery.createRequest({
    ...data,
    organizer_profile_id: organizer.id,
    expires_at,
  });

  await createNotification({
    user_id: volunteerRow[0].user_id,
    type: "new_request",
    title: "New session request",
    message: `${organizer.institution_name} sent you a request`,
    related_request_id: result.insertId,
  });

  return result;
};

// GET SINGLE
const getSingleRequest = async (id) => {
  const request = await requestQuery.getSingleRequest(id);
  if (!request) throw new Error("Request not found");
  return request;
};


const acceptRequest = async (requestId) => {
  const [rows] = await pool.execute(
    `SELECT sr.organizer_profile_id, op.user_id, u.full_name AS volunteer_name
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id
     JOIN users u ON vp.user_id = u.id
     WHERE sr.id = ?`,
    [requestId]
  );

  await requestQuery.updateRequestStatus(requestId, "accepted");

  if (rows[0]) {
    await createNotification({
      user_id: rows[0].user_id,
      type: "request_accepted",
      title: "Request Accepted",
      message: `${rows[0].volunteer_name} your session request accepted`,
      related_request_id: requestId,
    });
  }
};

const rejectRequest = async (requestId) => {
  const [rows] = await pool.execute(
    `SELECT op.user_id, u.full_name AS volunteer_name
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id
     JOIN users u ON vp.user_id = u.id
     WHERE sr.id = ?`,
    [requestId]
  );

  await requestQuery.updateRequestStatus(requestId, "rejected");

  if (rows[0]) {
    await createNotification({
      user_id: rows[0].user_id,
      type: "request_rejected",
      title: "Request Rejected",
      message: `${rows[0].volunteer_name} rejected your session request`,
      related_request_id: requestId,
    });
  }
};

const cancelRequest = async (requestId) => {
  return await requestQuery.updateRequestStatus(requestId, "cancelled");
};

module.exports = {
  createRequest,
  getSingleRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
};