const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
