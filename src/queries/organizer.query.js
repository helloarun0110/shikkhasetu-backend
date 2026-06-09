const pool = require("../config/db");

const createProfile = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO organizer_profiles
     (user_id, institution_name, institution_type, description, district, upazila,
      address, website_url, verification_document_url, contact_person_name, contact_person_designation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.institution_name,
      data.institution_type || null,
      data.description || null,
      data.district,
      data.upazila || null,
      data.address || null,
      data.website_url || null,
      data.verification_document_url || null,
      data.contact_person_name || null,
      data.contact_person_designation || null,
    ]
  );
  return result;
};


const getOrganizerRequests = async (userId, limit, page) => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id AND op.user_id = ?`,
    [userId]
  );

  const total = Number(countRows[0].total);

  const [rows] = await pool.execute(
    `SELECT
       sr.id,
       sr.status,
       sr.mode,
       sr.description,
       sr.expires_at,
       sr.created_at,
       s.name AS subject,
       c.name AS class_name,
       u.full_name AS volunteer_name,
       u.phone AS volunteer_phone,
       u.email AS volunteer_email,
       vp.university_name,
       vp.department
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id AND op.user_id = ?
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id
     JOIN users u ON vp.user_id = u.id
     JOIN subjects s ON sr.subject_id = s.id
     JOIN classes c ON sr.class_id = c.id
     WHERE sr.status != 'session_created'
     ORDER BY sr.created_at DESC
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

const getOrganizerRequestsCount = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(sr.id) as total
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id AND op.user_id = ?`,
    [userId]
  );
  return rows[0].total;
};

const updateProfile = async (userId, data) => {
  const [result] = await pool.execute(
    `
    UPDATE organizer_profiles
    SET
      institution_name = ?,
      institution_type = ?,
      description = ?,
      address = ?,
      website_url = ?,
      verification_document_url = ?,
      contact_person_name = ?,
      contact_person_designation = ?
    WHERE user_id = ?
    `,
    [
      data.institution_name,
      data.institution_type || null,
      data.description || null,
      data.address || null,
      data.website_url || null,
      data.verification_document_url || null,
      data.contact_person_name || null,
      data.contact_person_designation || null,
      userId
    ]
  );

  return result;
};



const getProfileByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT op.*, u.full_name, u.email, u.phone
     FROM organizer_profiles op
     JOIN users u ON op.user_id = u.id
     WHERE op.user_id = ?`,
    [userId]
  );
  return rows[0];
};


const getSentRequests = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       sr.*,
       u.full_name AS volunteer_name,
       vp.university_name,
       s.name AS subject_name
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id
     JOIN users u ON vp.user_id = u.id
     JOIN subjects s ON sr.subject_id = s.id
     WHERE op.user_id = ?
     ORDER BY sr.created_at DESC`,
    [userId]
  );
  return rows;
};

const getDashboardStats = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(sr.id) AS total_requests,
       SUM(CASE WHEN sr.status = 'accepted' THEN 1 ELSE 0 END) AS accepted_requests,
       SUM(CASE WHEN sr.status = 'pending' THEN 1 ELSE 0 END) AS pending_requests,
       SUM(CASE WHEN sr.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_requests
     FROM session_requests sr
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     WHERE op.user_id = ?`,
    [userId]
  );
  return rows[0];
};

module.exports = { createProfile,getOrganizerRequests, getProfileByUserId, getSentRequests, getDashboardStats, updateProfile };
