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

const getVolunteerRequests = async (userId, limit, page) => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM session_requests sr
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id AND vp.user_id = ?
     WHERE sr.status = 'pending'`,
    [userId],
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
       u.full_name AS organizer_name,
       u.phone AS organizer_phone,
       u.email AS organizer_email,
       op.institution_name,
       op.district
     FROM session_requests sr
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id AND vp.user_id = ?
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN users u ON op.user_id = u.id
     JOIN subjects s ON sr.subject_id = s.id
     JOIN classes c ON sr.class_id = c.id
     WHERE sr.status = 'pending'
     ORDER BY sr.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId],
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

const getVolunteerAcceptedRequests = async (userId, limit, page) => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM session_requests sr
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id AND vp.user_id = ?
     WHERE sr.status = 'accepted'`,
    [userId],
  );

  const total = Number(countRows[0].total);

  const [rows] = await pool.execute(
    `SELECT
       sr.id,
       sr.organizer_profile_id,
       sr.volunteer_profile_id,
       sr.subject_id,
       sr.class_id,
       sr.status,
       sr.mode,
       sr.description,
       sr.created_at,
       s.name AS subject,
       c.name AS class_name,
       u.full_name AS organizer_name,
       u.phone AS organizer_phone,
       u.email AS organizer_email,
       op.institution_name,
       op.district,
       op.upazila,
       vp2.full_name AS volunteer_name
     FROM session_requests sr
     JOIN volunteer_profiles vp ON sr.volunteer_profile_id = vp.id AND vp.user_id = ?
     JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
     JOIN users u ON op.user_id = u.id
     JOIN users vp2 ON vp.user_id = vp2.id
     JOIN subjects s ON sr.subject_id = s.id
     JOIN classes c ON sr.class_id = c.id
     WHERE sr.status = 'accepted'
     ORDER BY sr.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId],
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

const getVolunteerDashboardStats = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       SUM(CASE WHEN sr.status = 'pending' THEN 1 ELSE 0 END) AS pending_requests,
       SUM(CASE WHEN s.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_sessions,
       SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) AS completed_sessions
     FROM volunteer_profiles vp
     LEFT JOIN session_requests sr ON sr.volunteer_profile_id = vp.id
     LEFT JOIN sessions s ON s.volunteer_profile_id = vp.id
     WHERE vp.user_id = ?`,
    [userId],
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
    ],
  );
  return result;
};

const clean = (val) => (val && typeof val === "string" ? val.trim() : null);

const getFilteredVolunteers = async (filters = {}) => {
  const values = [];

  let baseQuery = `
    FROM volunteer_profiles vp
    JOIN users u ON vp.user_id = u.id
    WHERE 1=1
  `;

  const addFilter = (condition, value) => {
    if (value !== null && value !== undefined && value !== "") {
      baseQuery += condition;
      values.push(`%${value}%`);
    }
  };

  // LOCATION
  addFilter(` AND LOWER(vp.district) LIKE LOWER(?)`, clean(filters.district));
  addFilter(` AND LOWER(vp.upazila) LIKE LOWER(?)`, clean(filters.upazila));

  // UNIVERSITY
  addFilter(
    ` AND LOWER(vp.university_name) LIKE LOWER(?)`,
    clean(filters.university_name),
  );
  addFilter(
    ` AND LOWER(vp.department) LIKE LOWER(?)`,
    clean(filters.department),
  );

  // MODE
  const mode = clean(filters.mode);
  if (mode) {
    baseQuery += ` AND (LOWER(vp.teaching_mode) = LOWER(?) OR LOWER(vp.teaching_mode) = 'both')`;
    values.push(mode);
  }

  // SUBJECT
  const subject = clean(filters.subject_name);
  if (subject) {
    baseQuery += `
      AND vp.id IN (
        SELECT vs.volunteer_profile_id
        FROM volunteer_subjects vs
        JOIN subjects s ON vs.subject_id = s.id
        WHERE LOWER(s.name) LIKE LOWER(?)
      )
    `;
    values.push(`%${subject}%`);
  }

  // CLASS
  const className = clean(filters.class_name);
  if (className) {
    baseQuery += `
      AND vp.id IN (
        SELECT vc.volunteer_profile_id
        FROM volunteer_classes vc
        JOIN classes c ON vc.class_id = c.id
        WHERE LOWER(c.name) LIKE LOWER(?)
      )
    `;
    values.push(`%${className}%`);
  }

  // PAGINATION
  const limit = parseInt(filters.limit, 10) || 10;
  const page = parseInt(filters.page, 10) || 1;
  const offset = (page - 1) * limit;

  // COUNT
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total ${baseQuery}`,
    values,
  );

  const total = Number(countRows[0].total);

  // DATA
  const [rows] = await pool.execute(
    `
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
    ${baseQuery}
    ORDER BY vp.updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
    `,
    values,
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

const addSubjectsByName = async (
  volunteerProfileId,
  subjectNames,
  skillLevel,
) => {
  for (const name of subjectNames) {
    const [rows] = await pool.execute(
      `SELECT id FROM subjects WHERE name = ?`,
      [name],
    );

    if (!rows.length) continue;

    await pool.execute(
      `INSERT INTO volunteer_subjects 
        (volunteer_profile_id, subject_id, skill_level)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE skill_level = VALUES(skill_level)`,
      [volunteerProfileId, rows[0].id, skillLevel],
    );
  }
};

const addClassesByName = async (volunteerProfileId, classNames) => {
  for (const name of classNames) {
    const [rows] = await pool.execute(`SELECT id FROM classes WHERE name = ?`, [
      name,
    ]);

    if (!rows.length) continue;

    await pool.execute(
      `INSERT IGNORE INTO volunteer_classes 
        (volunteer_profile_id, class_id)
       VALUES (?, ?)`,
      [volunteerProfileId, rows[0].id],
    );
  }
};

const addAvailability = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO volunteer_availability 
      (volunteer_profile_id, day_of_week, start_time, end_time, is_active)
     VALUES (?, ?, ?, ?, TRUE)`,
    [
      data.volunteer_profile_id,
      data.day_of_week,
      data.start_time,
      data.end_time,
    ],
  );

  return result;
};

const removeClass = async (volunteerProfileId, classId) => {
  await pool.execute(
    `DELETE FROM volunteer_classes 
     WHERE volunteer_profile_id = ? AND class_id = ?`,
    [volunteerProfileId, classId],
  );
};

const getFullProfile = async (userId) => {
  const [profileRows] = await pool.execute(
    `SELECT vp.*, u.full_name, u.email, u.phone, u.profile_picture_url
     FROM volunteer_profiles vp
     JOIN users u ON vp.user_id = u.id
     WHERE vp.user_id = ?`,
    [userId],
  );

  const profile = profileRows[0];
  if (!profile) return null;

  const [subjects] = await pool.execute(
    `SELECT s.id, s.name, vs.skill_level
     FROM volunteer_subjects vs
     JOIN subjects s ON vs.subject_id = s.id
     WHERE vs.volunteer_profile_id = ?`,
    [profile.id],
  );

  const [classes] = await pool.execute(
    `SELECT c.id, c.name
   FROM volunteer_classes vc
   JOIN classes c ON vc.class_id = c.id
   WHERE vc.volunteer_profile_id = ?`,
    [profile.id],
  );

  const [availability] = await pool.execute(
    `SELECT
        id,
        day_of_week,
        start_time,
        end_time,
        is_active
     FROM volunteer_availability
     WHERE volunteer_profile_id = ?
     ORDER BY FIELD(
        day_of_week,
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
     )`,
    [profile.id],
  );

  return {
    ...profile,
    subjects,
    classes,
    availability,
  };
};

const getProfileByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM volunteer_profiles
     WHERE user_id = ?`,
    [userId],
  );

  return rows[0] || null;
};

const getVolunteerSubjects = async (volunteerId) => {
  const id = parseInt(volunteerId, 10);
  if (isNaN(id)) throw new Error("Invalid volunteer ID");

  const [rows] = await pool.execute(
    `
    SELECT s.id, s.name
    FROM volunteer_subjects vs
    JOIN subjects s ON vs.subject_id = s.id
    WHERE vs.volunteer_profile_id = ?
    `,
    [id],
  );

  return rows;
};

const getVolunteerClasses = async (volunteerId) => {
  try {
    const id = parseInt(volunteerId, 10);
    console.log("VOLUNTEER ID:", id, typeof id); // type দেখো
    const [rows] = await pool.execute(
      `
      SELECT c.id, c.name
      FROM volunteer_classes vc
      JOIN classes c ON vc.class_id = c.id
      WHERE vc.volunteer_profile_id = ?
      `,
      [id],
    );
    console.log("CLASS ROWS:", rows); // rows দেখো
    return rows;
  } catch (err) {
    console.error("getVolunteerClasses ERROR:", err.message);
    throw err;
  }
};

const getVolunteerAvailability = async (volunteerId) => {
  try {
    const id = parseInt(volunteerId, 10);
    const [rows] = await pool.execute(
      `
      SELECT day_of_week, start_time, end_time
      FROM volunteer_availability
      WHERE volunteer_profile_id = ?
      ORDER BY FIELD(day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
      `,
      [id],
    );
    return rows;
  } catch (err) {
    console.error("getVolunteerAvailability ERROR:", err.message);
    throw err;
  }
};

const removeSubject = async (volunteerProfileId, subjectId) => {
  const [result] = await pool.execute(
    `DELETE FROM volunteer_subjects WHERE volunteer_profile_id = ? AND subject_id = ?`,
    [volunteerProfileId, subjectId],
  );
  return result;
};

const removeAvailability = async (availabilityId, volunteerProfileId) => {
  const [result] = await pool.execute(
    `DELETE FROM volunteer_availability WHERE id = ? AND volunteer_profile_id = ?`,
    [availabilityId, volunteerProfileId],
  );
  return result;
};

const updateAvailability = async (availabilityId, volunteerProfileId, data) => {
  const [result] = await pool.execute(
    `UPDATE volunteer_availability 
     SET day_of_week = ?, start_time = ?, end_time = ?
     WHERE id = ? AND volunteer_profile_id = ?`,
    [
      data.day_of_week,
      data.start_time,
      data.end_time,
      availabilityId,
      volunteerProfileId,
    ],
  );
  return result;
};

module.exports = {
  createProfile,
  getVolunteerRequests,
  getVolunteerAcceptedRequests,
  getFilteredVolunteers,
  getVolunteerDashboardStats,
  getVolunteerClasses,
  getVolunteerSubjects,
  getVolunteerAvailability,
  getProfileByUserId,
  addSubjectsByName,
  addAvailability,
  addClassesByName,
  removeAvailability,
  updateAvailability,
  removeSubject,

  updateProfile,
  removeClass,
  getFullProfile,
};
