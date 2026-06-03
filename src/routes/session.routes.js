const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/session.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);


router.get("/", sessionController.getMySessions);


router.get("/:id", sessionController.getSession);


router.put("/:id/complete", sessionController.completeSession);


router.put("/:id/cancel", sessionController.cancelSession);

module.exports = router;
