const express = require("express");
const router = express.Router();

const controller = require("../controllers/employeeShiftController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, controller.assignShift);

router.get("/getAll", authMiddleware, controller.getEmployeeShifts);

router.get("/getByid/:id", authMiddleware, controller.getEmployeeShiftById);

router.put("/update/:id", authMiddleware, controller.updateEmployeeShift);

router.delete("/delete/:id", authMiddleware, controller.deleteEmployeeShift);

module.exports = router;