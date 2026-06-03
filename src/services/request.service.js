const pool = require("../config/db");
const requestQuery = require("../queries/request.query");
const organizerQuery = require("../queries/organizer.query");
const volunteerQuery = require("../queries/volunteer.query");

const createRequest = async (userId, data) => {

  const organizer = await organizerQuery.getProfileByUserId(userId);
  if (!organizer) throw new Error("Organizer profile not found");


  const expires_at = data.expires_at || new Date(Date.now() + 48 * 60 * 60 * 1000);

  return await requestQuery.createRequest({
    ...data,
    organizer_profile_id: organizer.id,
    expires_at,
  });
};

const getSingleRequest = async (id) => {
  const request = await requestQuery.getSingleRequest(id);
  if (!request) throw new Error("Request not found");
  return request;
};

//         sync logic — runs inside a DB transaction
const acceptRequest = async (requestId, userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //      load the request
    const request = await requestQuery.getSingleRequest(requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request is no longer pending");

    //          verify this volunteer owns the request
    const volunteerProfile = await volunteerQuery.getProfileByUserId(userId);
    if (!volunteerProfile || volunteerProfile.id !== request.volunteer_profile_id) {
      throw new Error("Unauthorized");
    }

    //          update request to accepted
    await connection.execute(
      `UPDATE session_requests SET status = 'accepted', responded_at = NOW() WHERE id = ?`,
      [requestId]
    );

    //          create the session
    await connection.execute(
      `INSERT INTO sessions
       (request_id, organizer_profile_id, volunteer_profile_id, subject_id,
        session_title, session_date, start_time, end_time, mode, meeting_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request.id,
        request.organizer_profile_id,
        request.volunteer_profile_id,
        request.subject_id,
        request.title,
        request.requested_date,
        request.start_time,
        request.end_time,
        request.mode,
        request.meeting_link || null,
      ]
    );

    //            auto-invalidate overlapping pending requests for this volunteer
    await connection.execute(
      `UPDATE session_requests
       SET status = 'auto_invalidated'
       WHERE volunteer_profile_id = ?
       AND requested_date = ?
       AND status = 'pending'
       AND id != ?
       AND (start_time < ? AND end_time > ?)`,
      [
        request.volunteer_profile_id,
        request.requested_date,
        requestId,
        request.end_time,
        request.start_time,
      ]
    );

    await connection.commit();
    return { message: "Request accepted and session created" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const rejectRequest = async (requestId, userId) => {
  const request = await requestQuery.getSingleRequest(requestId);
  if (!request) throw new Error("Request not found");

  const volunteerProfile = await volunteerQuery.getProfileByUserId(userId);
  if (!volunteerProfile || volunteerProfile.id !== request.volunteer_profile_id) {
    throw new Error("Unauthorized");
  }

  await requestQuery.rejectRequest(requestId);
  return { message: "Request rejected" };
};

module.exports = { createRequest, getSingleRequest, acceptRequest, rejectRequest };
