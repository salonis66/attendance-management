const express = require("express");
const router = express.Router();

const holidayController = require("../controllers/holidayController");
const adminAuth =require("../middleware/adminAuth.js")

// 🔐 Protected routes

router.post("/create", adminAuth, holidayController.createHoliday);

router.get("/getAll", holidayController.getHolidays);

router.get("/getById/:id", holidayController.getHolidayById);

router.put("/update/:id", adminAuth, holidayController.updateHoliday);

router.delete("/delete/:id", adminAuth, holidayController.deleteHoliday);

module.exports = router;