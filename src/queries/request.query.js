const pool = require("../config/db");

const createRequest = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO session_requests
     (organizer_profile_id, volunteer_profile_id, subject_id, title, description,
      requested_date, start_time, end_time, mode, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.organizer_profile_id,
      data.volunteer_profile_id,
      data.subject_id,
      data.title,
      data.description || null,
      data.requested_date,
      data.start_time,
      data.end_time,
      data.mode,
      data.expires_at,
    ]
  );
  return result;
};

const getSingleRequest = async (id) => {
  const [rows] = await pool.execute(
    `SELECT sr.*,
       s.name AS subject_name,
       vu.full_name AS volunteer_name,
       ou.full_name AS organizer_name,
       op.institution_name
     FROM session_requests sr
     JOIN subjects s ON sr.subject_id = s.id
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id
     JOIN users vu ON vp.user_id = vu.id
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN users ou ON op.user_id = ou.id
     WHERE sr.id = ?`,
    [id]
  );
  return rows[0];
};



const rejectRequest = async (id) => {
  await pool.execute(
    `UPDATE session_requests
     SET status = 'rejected', responded_at = NOW()
     WHERE id = ?`,
    [id]
  );
};



module.exports = {
  createRequest,
  getSingleRequest,
  rejectRequest
};
