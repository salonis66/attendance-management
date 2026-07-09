const express = require("express");
const router = express.Router();

const controller = require("../controllers/overtimeController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/apply", authMiddleware, controller.applyOvertime);

router.put("/update/:id/status", authMiddleware, controller.updateOvertimeStatus);

router.get("/getAll", authMiddleware, controller.getOvertimeRequests);

router.get("/employee/:employeeId", authMiddleware, controller.getOvertimeByEmployee);

router.put("/cancel/:id", authMiddleware, controller.cancelOvertimeRequest);

module.exports = router;