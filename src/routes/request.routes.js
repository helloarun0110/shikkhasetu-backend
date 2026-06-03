const express = require("express");
const router = express.Router();

const requestController = require("../controllers/request.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);


router.get("/:id", requestController.getRequest);


router.post("/:id/accept", roleMiddleware("volunteer"), requestController.acceptRequest);


router.post("/:id/reject", roleMiddleware("volunteer"), requestController.rejectRequest);

module.exports = router;
