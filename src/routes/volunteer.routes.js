const express = require("express");
const router = express.Router();

const volunteerController = require("../controllers/volunteer.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  validateVolunteerProfile,
  validateAvailability,
  validateSubject,
} = require("../validations/volunteer.validation");

router.use(authMiddleware);

router.get(
  "/my-profile/full",
  roleMiddleware("volunteer"),
  volunteerController.getFullProfile,
);


router.put(
  "/profile",
  roleMiddleware("volunteer"),
  validateVolunteerProfile,
  volunteerController.updateProfile,
);

router.get("/", volunteerController.getFilteredVolunteers);

router.get(
  "/requests",
  roleMiddleware("volunteer"),
  volunteerController.getMyRequests,
);

router.get(
  "/accepted",
  roleMiddleware("volunteer"),
  volunteerController.getAcceptedRequests,
);

router.post(
  "/subjects",
  roleMiddleware("volunteer"),
  validateSubject,
  volunteerController.addSubject,
);

router.post(
  "/availability",
  roleMiddleware("volunteer"),
  validateAvailability,
  volunteerController.addAvailability,
);

router.post(
  "/classes",
  roleMiddleware("volunteer"),
  volunteerController.addClass,
);

router.delete(
  "/classes/:class_id",
  roleMiddleware("volunteer"),
  volunteerController.removeClass,
);

router.delete(
  "/subjects/:subject_id",
  roleMiddleware("volunteer"),
  volunteerController.removeSubject,
);
router.delete(
  "/availability/:availability_id",
  roleMiddleware("volunteer"),
  volunteerController.removeAvailability,
);

router.put(
  "/availability/:availability_id",
  roleMiddleware("volunteer"),
  volunteerController.updateAvailability,
);

router.get("/classes/:volunteer_id", volunteerController.getVolunteerClasses);
router.get("/subjects/:volunteer_id", volunteerController.getVolunteerSubjects);
router.get(
  "/availability/:volunteer_id",
  volunteerController.getVolunteerAvailability,
);

router.get(
  "/dashboard",
  roleMiddleware("volunteer"),
  volunteerController.getDashboardStats,
);

module.exports = router;
