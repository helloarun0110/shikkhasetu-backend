const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");



const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );

    return successResponse(res, rows);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};




const markAsRead = async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    return successResponse(res, null, "Notification marked as read");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};




const markAllRead = async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    );


    return successResponse(res, null, "all notification are marked as read");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};





const deleteNotification = async (req, res) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );


    return successResponse(res, null, "notification deleted");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};




module.exports = { getNotifications, markAsRead, markAllRead, deleteNotification };
