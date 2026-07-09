const express = require("express");
const router = express.Router();

const controller = require("../controllers/leaveRequestController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/apply", authMiddleware, controller.applyLeave);

router.put("/update/:id/status", authMiddleware, controller.updateLeaveStatus);

router.get("/getAll", authMiddleware, controller.getLeaveRequests);

router.get("/employee/:employeeId", authMiddleware, controller.getLeaveByEmployee);
router.put("/cancel/:id", authMiddleware, controller.cancelLeaveRequest);

module.exports = router;