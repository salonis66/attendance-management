const express = require("express");
const router = express.Router();

const shiftController = require("../controllers/shiftController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, shiftController.createShift);

router.get("/getAll", authMiddleware, shiftController.getShifts);

router.get("/getById/:id", authMiddleware, shiftController.getShiftById);

router.put("/update/:id", authMiddleware, shiftController.updateShift);

router.delete("/delete/:id", authMiddleware, shiftController.deleteShift);

module.exports = router;