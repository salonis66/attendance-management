const express = require("express");
const router = express.Router();

const controller = require("../controllers/leaveBalanceController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, controller.createLeaveBalance);

router.get("/getAll", authMiddleware, controller.getLeaveBalances);

router.get("/getById/:employeeId", authMiddleware, controller.getLeaveBalanceByEmployee);

router.put("/update/:id", authMiddleware, controller.updateLeaveBalance);

router.delete("/delete/:id", authMiddleware, controller.deleteLeaveBalance);

module.exports = router;