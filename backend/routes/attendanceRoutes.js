const express = require("express");
const router = express.Router();

const controller = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/check-in/:EmployeeId", authMiddleware, controller.checkIn);

router.post("/check-out/:EmployeeId", authMiddleware, controller.checkOut);

router.get("/getAll", authMiddleware, controller.getAttendance);

router.get("/getbyId/:employeeId", authMiddleware, controller.getAttendanceByEmployee);

router.delete("/delete/:id", authMiddleware, controller.deleteAttendance);

module.exports = router;