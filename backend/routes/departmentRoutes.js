const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authentication");

// 🔐 All routes protected

router.post("/create", authMiddleware, departmentController.createDepartment);

router.get("/getAll", authMiddleware, departmentController.getDepartments);

router.get("/getByid/:id", authMiddleware, departmentController.getDepartmentById);

router.put("/update/:id", authMiddleware, departmentController.updateDepartment);

router.delete("/delete/:id", authMiddleware, departmentController.deleteDepartment);

module.exports = router;