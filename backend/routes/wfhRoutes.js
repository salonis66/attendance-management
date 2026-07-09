const express = require("express");
const router = express.Router();

const controller = require("../controllers/wfhController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/apply", authMiddleware, controller.applyWFH);

router.put("/update/:id/status", authMiddleware, controller.updateWFHStatus);

router.get("/getAll", authMiddleware, controller.getWFHRequests);

router.get("/employee/:employeeId", authMiddleware, controller.getWFHByEmployee);
router.put("/cancel/:id", authMiddleware, controller.cancelWFHRequest);

module.exports = router;