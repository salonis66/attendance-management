const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// 🔓 Public
router.post("/register", controller.registerAdmin);
router.post("/login", controller.loginAdmin);

// 🔐 Protected example
router.get("/getAll", adminAuth, controller.getAllAdmins);
router.get("/getById/:id", adminAuth, controller.getAdminById);
router.put("/update/:id", adminAuth, controller.updateAdmin);
router.delete("/delete/:id", adminAuth, controller.deleteAdmin);

module.exports = router;