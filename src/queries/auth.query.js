const pool = require("../config/db");

const createUser = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [data.full_name, data.email, data.phone, data.password_hash, data.role]
  );
  return result;
};


const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, phone, role, profile_picture_url, is_verified, created_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0];
};

const updateUserProfile = async (userId, data) => {
  const [result] = await pool.execute(
    `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
    [data.full_name, data.phone, userId]
  );
  return result;
};

const updatePassword = async (userId, passwordHash) => {
  const [result] = await pool.execute(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [passwordHash, userId]
  );
  return result;
};

module.exports = { createUser, findUserById , updateUserProfile,updatePassword};



