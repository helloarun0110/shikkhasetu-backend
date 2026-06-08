const express = require("express");
const router = express.Router();

const organizerController = require("../controllers/organizer.controller");
const requestController = require("../controllers/request.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware, roleMiddleware("organizer"));


router.get("/profile", organizerController.getMyProfile);


router.post("/request", requestController.createRequest);

router.get("/my-requests", organizerController.getOrganizerRequests);


router.get("/dashboard", organizerController.getDashboardStats);


module.exports = router;
