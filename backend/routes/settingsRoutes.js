const express = require("express");
const router = express.Router();
const adminAuth=require("../middleware/adminAuth.js")

const controller = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/save", adminAuth, controller.saveMultipleSettings);

router.get("/getAll", adminAuth, controller.getSettings);

router.get("/getByKey/:key", adminAuth, controller.getSettingByKey);

router.delete("/delete/:key", adminAuth, controller.deleteSetting);

module.exports = router;