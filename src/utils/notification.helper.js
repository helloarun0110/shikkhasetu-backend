const pool = require("../config/db");

const createNotification = async ({
  user_id,
  type,
  title,
  message,
  related_request_id = null,
  related_session_id = null,
}) => {
  try {
    await pool.execute(
      `INSERT INTO notifications
        (user_id, type, title, message, related_request_id, related_session_id, is_seen)
        VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [user_id, type, title, message, related_request_id, related_session_id]
    );
  } catch (err) {
    console.error("[notification] failed to create:", err.message);
  }
};

module.exports = { createNotification };