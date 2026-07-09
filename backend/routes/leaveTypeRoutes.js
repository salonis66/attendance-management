const express = require("express");
const router = express.Router();

const controller = require("../controllers/leaveTypeController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, controller.createLeaveType);

router.get("/getAll", authMiddleware, controller.getLeaveTypes);

router.get("/getById/:id", authMiddleware, controller.getLeaveTypeById);

router.put("/update/:id", authMiddleware, controller.updateLeaveType);

router.delete("/delete/:id", authMiddleware, controller.deleteLeaveType);

module.exports = router;