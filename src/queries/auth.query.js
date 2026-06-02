const pool = require("../config/db");

const createUser = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [data.full_name, data.email, data.phone, data.password_hash, data.role]
  );
  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, phone, role, profile_picture_url, is_verified, created_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById };



