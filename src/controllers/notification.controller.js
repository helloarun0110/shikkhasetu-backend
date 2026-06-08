const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id],
    );
    return successResponse(res, rows);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getUnseenCount = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_seen = FALSE`,
      [req.user.id],
    );
    return successResponse(res, { count: rows[0].count });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const markAllSeen = async (req, res) => {
  try {
    await pool.execute(
      `UPDATE notifications SET is_seen = TRUE WHERE user_id = ? AND is_seen = FALSE`,
      [req.user.id],
    );
    return successResponse(res, null, "All notifications marked as seen");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    return successResponse(res, null, "Notification marked as read");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};


const deleteNotification = async (req, res) => {
  try {
    await pool.execute(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    return successResponse(res, null, "Notification deleted");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};


module.exports = {
  getNotifications,
  getUnseenCount,
  markAsRead,
   markAllSeen ,
  deleteNotification,
};
