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


router.get("/", volunteerController.getVolunteers);


router.use(authMiddleware);


router.get("/my-profile", roleMiddleware("volunteer"), volunteerController.getMyProfile);


router.get("/requests", roleMiddleware("volunteer"), volunteerController.getMyRequests);


router.post(
  "/profile",
  roleMiddleware("volunteer"),
  validateVolunteerProfile,
  volunteerController.createProfile
);


router.put(
  "/profile",
  roleMiddleware("volunteer"),
  validateVolunteerProfile,
  volunteerController.updateProfile
);


router.put("/open-status", roleMiddleware("volunteer"), volunteerController.updateOpenStatus);


router.post(
  "/subjects",
  roleMiddleware("volunteer"),
  validateSubject,
  volunteerController.addSubject
);


router.post(
  "/availability",
  roleMiddleware("volunteer"),
  validateAvailability,
  volunteerController.addAvailability
);


router.post(
  "/requests/:id/accept",
  roleMiddleware("volunteer"),
  volunteerController.getMyRequests 
);




router.get("/my-profile/full", roleMiddleware("volunteer"), volunteerController.getFullProfile);


router.post("/classes", roleMiddleware("volunteer"), volunteerController.addClass);


router.delete("/classes/:class_id", roleMiddleware("volunteer"), volunteerController.removeClass);


module.exports = router;
