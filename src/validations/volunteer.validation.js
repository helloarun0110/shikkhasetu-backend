const validateVolunteerProfile = (req, res, next) => {
  const { university_name, department, district } = req.body;

  if (!university_name || !department || !district) {
    return res.status(400).json({
      success: false,
      message: "university_name, department, and district are required",
    });
  }

  next();
};

const validateAvailability = (req, res, next) => {
  const { day_of_week, start_time, end_time } = req.body;

  const validDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  if (!day_of_week || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "day_of_week, start_time, and end_time are required",
    });
  }

  if (!validDays.includes(day_of_week)) {
    return res.status(400).json({
      success: false,
      message: `day_of_week must be one of: ${validDays.join(", ")}`,
    });
  }

  next();
};

const validateSubject = (req, res, next) => {
  const { subject_names, skill_level } = req.body;

  if (!subject_names || !subject_names.length) {
    return res.status(400).json({
      success: false,
      message: "subject_names is required",
    });
  }

  const validLevels = ["basic", "intermediate", "advanced"];
  if (skill_level && !validLevels.includes(skill_level)) {
    return res.status(400).json({
      success: false,
      message: "skill_level must be basic, intermediate, or advanced",
    });
  }

  next();
};

module.exports = { validateVolunteerProfile, validateAvailability, validateSubject };
