const pool = require("../config/db");

const createProfile = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO volunteer_profiles
     (user_id, university_name, department, academic_year, bio, district, upazila, address, teaching_mode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.university_name,
      data.department,
      data.academic_year || null,
      data.bio || null,
      data.district,
      data.upazila || null,
      data.address || null,
      data.teaching_mode || "both",
    ]
  );
  return result;
};

const getProfileByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT vp.*, u.full_name, u.email, u.phone, u.profile_picture_url
     FROM volunteer_profiles vp
     JOIN users u ON vp.user_id = u.id
     WHERE vp.user_id = ?`,
    [userId]
  );
  return rows[0];
};

const updateProfile = async (userId, data) => {
  const [result] = await pool.execute(
    `UPDATE volunteer_profiles
     SET university_name = ?, department = ?, academic_year = ?,
         bio = ?, district = ?, upazila = ?, address = ?,
         teaching_mode = ?, experience_text = ?, updated_at = NOW()
     WHERE user_id = ?`,
    [
      data.university_name,
      data.department,
      data.academic_year || null,
      data.bio || null,
      data.district,
      data.upazila || null,
      data.address || null,
      data.teaching_mode,
      data.experience_text || null,
      userId,
    ]
  );
  return result;
};


const getFilteredVolunteers = async (filters) => {
  let sql = `
    SELECT
      vp.id,
      u.full_name,
      u.profile_picture_url,
      vp.university_name,
      vp.department,
      vp.district,
      vp.upazila,
      vp.teaching_mode,
      vp.bio
    FROM volunteer_profiles vp
    JOIN users u ON vp.user_id = u.id
    WHERE vp.open_to_volunteer = TRUE
    AND u.is_active = TRUE
  `;

  const values = [];

  if (filters.district) {
    sql += ` AND vp.district = ?`;
    values.push(filters.district);
  }

  if (filters.mode) {
    sql += ` AND (vp.teaching_mode = ? OR vp.teaching_mode = 'both')`;
    values.push(filters.mode);
  }

  if (filters.subject) {
    sql += `
      AND vp.id IN (
        SELECT vs.volunteer_profile_id
        FROM volunteer_subjects vs
        JOIN subjects s ON vs.subject_id = s.id
        WHERE s.name = ?
      )
    `;
    values.push(filters.subject);
  }

  sql += ` ORDER BY vp.updated_at DESC`;

  const [rows] = await pool.execute(sql, values);
  return rows;
};

const updateOpenStatus = async (userId, isOpen) => {
  await pool.execute(
    `UPDATE volunteer_profiles
     SET open_to_volunteer = ?, updated_at = NOW()
     WHERE user_id = ?`,
    [isOpen, userId]
  );
};

const addSubject = async (volunteerProfileId, subjectId, skillLevel) => {
  const [result] = await pool.execute(
    `INSERT INTO volunteer_subjects (volunteer_profile_id, subject_id, skill_level)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE skill_level = ?`,
    [volunteerProfileId, subjectId, skillLevel || "intermediate", skillLevel || "intermediate"]
  );
  return result;
};

const getSubjects = async (volunteerProfileId) => {
  const [rows] = await pool.execute(
    `SELECT s.id, s.name, vs.skill_level
     FROM volunteer_subjects vs
     JOIN subjects s ON vs.subject_id = s.id
     WHERE vs.volunteer_profile_id = ?`,
    [volunteerProfileId]
  );
  return rows;
};

const addAvailability = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO volunteer_availability (volunteer_profile_id, day_of_week, start_time, end_time, is_active)
     VALUES (?, ?, ?, ?, TRUE)`,
    [data.volunteer_profile_id, data.day_of_week, data.start_time, data.end_time]
  );
  return result;
};

const getMyRequests = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       sr.*,
       op.institution_name,
       s.name AS subject_name,
       u.full_name AS organizer_name
     FROM session_requests sr
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN users u ON op.user_id = u.id
     JOIN subjects s ON sr.subject_id = s.id
     WHERE vp.user_id = ?
     ORDER BY sr.created_at DESC`,
    [userId]
  );
  return rows;
};

module.exports = {
  createProfile,
  getProfileByUserId,
  updateProfile,
  getFilteredVolunteers,
  updateOpenStatus,
  addSubject,
  getSubjects,
  addAvailability,
  getMyRequests,
};
