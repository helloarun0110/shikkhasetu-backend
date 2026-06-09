const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const volunteerRoutes = require("./routes/volunteer.routes");
const organizerRoutes = require("./routes/organizer.routes");
const requestRoutes = require("./routes/request.routes");
const sessionRoutes = require("./routes/session.routes");
const publicRoutes = require("./routes/public.routes");
const notificationRoutes = require("./routes/notification.routes");
const errorMiddleware = require("./middlewares/error.middleware");

// Start the cron scheduler
require("./utils/scheduler");

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));



// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Shikkhasetu API Running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/public", publicRoutes);

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
