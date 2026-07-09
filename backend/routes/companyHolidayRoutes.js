const express = require("express");
const router = express.Router();

const controller = require("../controllers/companyHolidayController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, controller.assignHoliday);

router.get("/getAll", authMiddleware, controller.getCompanyHolidays);

router.get("/getById/:id", authMiddleware, controller.getCompanyHolidayById);

router.put("/update/:id", authMiddleware, controller.updateCompanyHoliday);

router.delete("/delete/:id", authMiddleware, controller.deleteCompanyHoliday);

module.exports = router;