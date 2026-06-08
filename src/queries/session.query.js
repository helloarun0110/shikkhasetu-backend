const pool = require("../config/db");

const createSession = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO sessions (
       request_id,
       organizer_profile_id,
       volunteer_profile_id,
       subject_id,
       class_id,
       session_title,
       session_date,
       start_time,
       end_time,
       mode,
       meeting_link
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.request_id,
      data.organizer_profile_id,
      data.volunteer_profile_id,
      data.subject_id,
      data.class_id,
      data.session_title,
      data.session_date,
      data.start_time,
      data.end_time,
      data.mode,
      data.meeting_link || null,
    ]
  );
  return result;
};

const getVolunteerSessions = async (userId, limit, page) => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM sessions s
     JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id AND vp.user_id = ?`,
    [userId]
  );

  const total = Number(countRows[0].total);

  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.session_title,
       s.session_date,
       s.start_time,
       s.end_time,
       s.mode,
       s.meeting_link,
       s.status,
       s.created_at,
       u.full_name AS organizer_name,
       u.phone AS organizer_phone,
       u.email AS organizer_email,
       op.institution_name,
       op.district
     FROM sessions s
     JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id AND vp.user_id = ?
     JOIN organizer_profiles op ON s.organizer_profile_id = op.id
     JOIN users u ON op.user_id = u.id
     ORDER BY
       FIELD(s.status, 'scheduled', 'completed', 'cancelled'),
       s.session_date DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

const getOrganizerSessions = async (userId, limit, page) => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM sessions s
     JOIN organizer_profiles op ON s.organizer_profile_id = op.id AND op.user_id = ?`,
    [userId]
  );

  const total = Number(countRows[0].total);

  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.session_title,
       s.session_date,
       s.start_time,
       s.end_time,
       s.mode,
       s.meeting_link,
       s.status,
       s.created_at,
       u.full_name AS volunteer_name,
       u.phone AS volunteer_phone,
       u.email AS volunteer_email,
       vp.university_name,
       vp.department
     FROM sessions s
     JOIN organizer_profiles op ON s.organizer_profile_id = op.id AND op.user_id = ?
     JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
     JOIN users u ON vp.user_id = u.id
     ORDER BY
       FIELD(s.status, 'scheduled', 'completed', 'cancelled'),
       s.session_date DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};


const updateSessionStatus = async (sessionId, status) => {
  const [result] = await pool.execute(
    `UPDATE sessions SET status = ? WHERE id = ?`,
    [status, sessionId]
  );
  return result;
};

const getSessionById = async (id) => {
  const [rows] = await pool.execute(
    `
    SELECT s.*,
           vu.full_name AS volunteer_name,
           ou.full_name AS organizer_name,
           op.institution_name,
           sub.name AS subject_name,
           c.name AS class_name
    FROM sessions s
    JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
    JOIN users vu ON vp.user_id = vu.id
    JOIN organizer_profiles op ON s.organizer_profile_id = op.id
    JOIN users ou ON op.user_id = ou.id
    JOIN subjects sub ON s.subject_id = sub.id
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = ?
    `,
    [id]
  );

  return rows[0];
};


module.exports = {
  getOrganizerSessions,
  getVolunteerSessions,
  createSession,
  updateSessionStatus,

 
  getSessionById,
};