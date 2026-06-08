const sessionQuery = require("../queries/session.query");
const pool = require("../config/db");
const { createNotification } = require("../utils/notification.helper");

const createSession = async (data) => {
  const result = await sessionQuery.createSession(data);

  await pool.execute(
    `UPDATE session_requests SET status = 'session_created' WHERE id = ?`,
    [data.request_id],
  );

  
  const [rows] = await pool.execute(
    `SELECT op.user_id AS organizer_user_id, u.full_name AS volunteer_name
   FROM organizer_profiles op
   JOIN users u ON u.id = (
     SELECT user_id FROM volunteer_profiles WHERE id = ?
   )
   WHERE op.id = ?`,
    [data.volunteer_profile_id, data.organizer_profile_id],
  );

  if (rows[0]) {
    await createNotification({
      user_id: rows[0].organizer_user_id,
      type: "session_reminder",
      title: "Session Scheduled",
      message: `${rows[0].volunteer_name} has scheduled a session for your request`,
      related_session_id: result.insertId,
    });
  }

  return result;
};

const getVolunteerSessions = async (userId, page, limit) => {
  return await sessionQuery.getVolunteerSessions(userId, limit, page);
};

const getOrganizerSessions = async (userId, page, limit) => {
  return await sessionQuery.getOrganizerSessions(userId, limit, page);
};

const completeSession = async (sessionId) => {
  await sessionQuery.updateSessionStatus(sessionId, "completed");

  const [rows] = await pool.execute(
    `SELECT 
       op.user_id AS organizer_user_id,
       vu.full_name AS volunteer_name
     FROM sessions s
     JOIN organizer_profiles op ON s.organizer_profile_id = op.id
     JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
     JOIN users vu ON vp.user_id = vu.id
     WHERE s.id = ?`,
    [sessionId]
  );

  if (rows[0]) {
    await createNotification({
      user_id: rows[0].organizer_user_id,
      type: "session_completed",
      title: "Session Completed",
      message: `${rows[0].volunteer_name} marked the session as completed`,
      related_session_id: sessionId,
    });
  }
};

const cancelSession = async (sessionId, userId) => {
  await sessionQuery.updateSessionStatus(sessionId, "cancelled");

  const [rows] = await pool.execute(
    `SELECT 
       op.user_id AS organizer_user_id,
       vp.user_id AS volunteer_user_id,
       ou.full_name AS organizer_name,
       vu.full_name AS volunteer_name
     FROM sessions s
     JOIN organizer_profiles op ON s.organizer_profile_id = op.id
     JOIN users ou ON op.user_id = ou.id
     JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
     JOIN users vu ON vp.user_id = vu.id
     WHERE s.id = ?`,
    [sessionId]
  );

  if (rows[0]) {
    const isVolunteer = rows[0].volunteer_user_id === userId;

    if (isVolunteer) {
      await createNotification({
        user_id: rows[0].organizer_user_id,
        type: "session_cancelled",
        title: "Session Cancelled",
        message: `${rows[0].volunteer_name} cancelled the session`,
        related_session_id: sessionId,
      });
    } else {
      await createNotification({
        user_id: rows[0].volunteer_user_id,
        type: "session_cancelled",
        title: "Session Cancelled",
        message: `${rows[0].organizer_name} cancelled the session`,
        related_session_id: sessionId,
      });
    }
  }
};

const getSessionById = async (id) => {
  const session = await sessionQuery.getSessionById(id);
  if (!session) throw new Error("Session not found");
  return session;
};

module.exports = {
  createSession,
  getVolunteerSessions,
  getOrganizerSessions,
  completeSession,
  cancelSession,
  getSessionById,
};
