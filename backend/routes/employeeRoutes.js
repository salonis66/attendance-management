const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, employeeController.createEmployee);

router.get("/getAll", authMiddleware, employeeController.getEmployees);

router.get("/getbyId/:id", authMiddleware, employeeController.getEmployeeById);

router.put("/update/:id", authMiddleware, employeeController.updateEmployee);

router.delete("/delete/:id", authMiddleware, employeeController.deleteEmployee);

module.exports = router;