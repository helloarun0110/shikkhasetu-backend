const express = require("express");
const router = express.Router();

const requestController = require("../controllers/request.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// CREATE REQUEST (organizer)
router.post("/", roleMiddleware("organizer"), requestController.createRequest);

// GET SINGLE REQUEST
router.get("/:id", requestController.getRequest);

// ACCEPT REQUEST (volunteer)
router.post(
  "/:id/accept",
  roleMiddleware("volunteer"),
  requestController.acceptRequest,
);

// REJECT REQUEST (volunteer)
router.post(
  "/:id/reject",
  roleMiddleware("volunteer"),
  requestController.rejectRequest,
);

// CANCEL REQUEST (organizer)
router.post(
  "/:id/cancel",
  roleMiddleware("organizer"),
  requestController.cancelRequest
);

module.exports = router;
