const pool = require("../config/db");

const getMySessions = async (userId, role) => {
  let sql;

  if (role === "volunteer") {
    sql = `
      SELECT
        s.*,
        op.institution_name,
        ou.full_name AS organizer_name,
        sub.name AS subject_name
      FROM sessions s
      JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
      JOIN organizer_profiles op ON s.organizer_profile_id = op.id
      JOIN users ou ON op.user_id = ou.id
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE vp.user_id = ?
      ORDER BY s.session_date DESC
    `;
  } else {
    sql = `
      SELECT
        s.*,
        vu.full_name AS volunteer_name,
        vp.university_name,
        sub.name AS subject_name
      FROM sessions s
      JOIN organizer_profiles op ON s.organizer_profile_id = op.id
      JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
      JOIN users vu ON vp.user_id = vu.id
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE op.user_id = ?
      ORDER BY s.session_date DESC
    `;
  }

  const [rows] = await pool.execute(sql, [userId]);
  return rows;
};

const getSessionById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT s.*,
       vu.full_name AS volunteer_name,
       ou.full_name AS organizer_name,
       op.institution_name,
       sub.name AS subject_name
     FROM sessions s
     JOIN volunteer_profiles vp ON s.volunteer_profile_id = vp.id
     JOIN users vu ON vp.user_id = vu.id
     JOIN organizer_profiles op ON s.organizer_profile_id = op.id
     JOIN users ou ON op.user_id = ou.id
     JOIN subjects sub ON s.subject_id = sub.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0];
};

const completeSession = async (id, notes) => {
  await pool.execute(
    `UPDATE sessions
     SET status = 'completed', completion_notes = ?, updated_at = NOW()
     WHERE id = ?`,
    [notes || null, id]
  );
};

const cancelSession = async (id) => {
  await pool.execute(
    `UPDATE sessions SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
    [id]
  );
};

module.exports = { getMySessions, getSessionById, completeSession, cancelSession };
