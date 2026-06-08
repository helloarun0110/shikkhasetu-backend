const cron = require("node-cron");
const pool = require("../config/db");
const { createNotification } = require("./notification.helper");

cron.schedule("*/5 * * * *", async () => {
  try {
    const [expiredRequest] = await pool.execute(
      `SELECT
    sr.id,
    sr.organizer_profile_id,
    u.id AS organizer_user_id
  FROM session_requests sr
  JOIN organizer_profiles op ON sr.organizer_profile_id = op.id
  JOIN users u ON op.user_id = u.id
  WHERE sr.status = 'pending'
  AND sr.expires_at < NOW()`,
    );

    if (expiredRequest.length === 0) return;

    const [result] = await pool.execute(`
      UPDATE session_requests
      SET status = 'expired'
      WHERE status = 'pending'
      AND expires_at < NOW()
    `);

    if (result.affectedRows > 0) {
      console.log(`[Scheduler] Expired ${result.affectedRows} request(s)`);
    }

    for (const req of expiredRequest) {
      await createNotification({
        user_id: req.organizer_user_id,
        type: "request_expired",
        title: "Request Expired",
        message: `Your session request has expired. The volunteer did not respond in time.`,
        related_request_id: req.id,
      });
    }
  } catch (error) {
    console.error("[Scheduler] Error expiring requests:", error.message);
  }
});
