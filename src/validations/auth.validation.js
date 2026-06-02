const validateRegister = (req, res, next) => {
  const { full_name, email, phone, password, role } = req.body;

  if (!full_name || !email || !phone || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: full_name, email, phone, password, role",
    });
  }

  const allowedRoles = ["volunteer", "organizer"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be either 'volunteer' or 'organizer'",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };
