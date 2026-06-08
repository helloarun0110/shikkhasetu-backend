const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/session.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");


router.use(authMiddleware);
router.post("/", roleMiddleware("volunteer"), sessionController.createSession);

router.get("/", sessionController.getMySessions);
router.put("/:id/complete", roleMiddleware("volunteer"), sessionController.completeSession);
router.put("/:id/cancel", sessionController.cancelSession);


router.get("/:id", sessionController.getSession);


module.exports = router;
