const pool = require("../config/db");
const requestQuery = require("../queries/request.query");
const organizerQuery = require("../queries/organizer.query");
const volunteerQuery = require("../queries/volunteer.query");
const {createNotification} = require("../utils/notification.helper");



// organizer-->volunteer--->create notification for the volunteer

const createRequest = async (userId, data) => {

  const organizer = await organizerQuery.getProfileByUserId(userId);
  if (!organizer) throw new Error("Organizer profile not found");


const [volunteerRow] = await pool.execute(
  `SELECT vp.id, vp.user_id
   FROM volunteer_profiles vp
   JOIN users u ON vp.user_id = u.id
   WHERE vp.id = ?
   AND vp.open_to_volunteer = TRUE
   AND u.is_active = TRUE
    `,
  [data.volunteer_profile_id]
);


if(!volunteerRow[0]){
  throw new Error("volunteer not found or not currently open, sorry..");
}

const volunteerUserId = volunteerRow[0].user_id;




const expires_at = data.expires_at || new Date(Date.now() + 48 * 60 * 60 * 1000);

result = await requestQuery.createRequest({
  ...data,
  organizer_profile_id: organizer.id,
  expires_at,
});



await createNotification({
  user_id: volunteerUserId,
  type: "new_request",
  title: "new session request",
  message: `${organizer.institution_name} has sent you a session request: "${data.title}"`,
  related_request_id: result.insertId,
});

return result;

};






const getSingleRequest = async (id) => {
  const request = await requestQuery.getSingleRequest(id);
  if (!request) throw new Error("Request not found");
  return request;
};






//  sync logic — runs inside a DB transaction
//    |    mark request --> create session --> store overlapping --> auto-invalidate --> notify

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
    const [sessionResult] = await connection.execute(
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


    const newSessionId = sessionResult.insertId;


// find overlapping to notify organizer
   const [overlapping] = await connection.execute(
      `SELECT sr.id, op.user_id AS organizer_user_id, sr.title
       FROM session_requests sr
       JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
       WHERE sr.volunteer_profile_id = ?
       AND sr.requested_date = ?
       AND sr.status = 'pending'
       AND sr.id != ?
       AND (sr.start_time < ? AND sr.end_time > ?)`,
      [
        request.volunteer_profile_id,
        request.requested_date,
        requestId,
        request.end_time,
        request.start_time,
      ]
    );




    //    auto-invalidate overlapping pending requests for this volunteer
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


 
    // notify the organizer whose request was accepted and auto-invalidate

    await createNotification({
      user_id: request.organizer_user_id, 
      type: "request_accepted",
      title: "request accepted...!!!",
      message: `your session request "${request.title}" has been accepted. Check your sessions for details.`,
      related_request_id: requestId,
      related_session_id: newSessionId,
    });
 

    for (const row of overlapping) {
      await createNotification({
        user_id: row.organizer_user_id,
        type: "request_auto_invalidated",
        title: "request no longer available",
        message: `your request "${row.title}" could not be fulfilled — the volunteer accepted another session at the same time.`,
        related_request_id: row.id,
      });
    }




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
