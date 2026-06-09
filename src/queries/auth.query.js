const pool = require("../config/db");

const createUser = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [data.full_name, data.email, data.phone, data.password_hash, data.role],
  );
  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM users WHERE id = ?`,
    [id],
  );
  return rows[0];
};

const updateUserProfile = async (userId, data) => {
  const [result] = await pool.execute(
    `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
    [data.full_name, data.phone, userId],
  );
  return result;
};

const updatePassword = async (userId, passwordHash) => {
  const [result] = await pool.execute(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [passwordHash, userId],
  );
  return result;
};

const saveResetToken = async (userId, token, expires) => {
  await pool.execute(
    `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?`,
    [token, expires, userId]
  );
};

const findUserByResetToken = async (token) => {
  const [rows] = await pool.execute(
    `SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()`,
    [token]
  );
  return rows[0];
};

const clearResetToken = async (userId) => {
  await pool.execute(
    `UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
    [userId]
  );
};

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  updatePassword,
  updateUserProfile,
  saveResetToken,
  findUserByResetToken,
  clearResetToken
};
