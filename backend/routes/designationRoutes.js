const express = require("express");
const router = express.Router();

const designationController = require("../controllers/designationController");
const authMiddleware = require("../middleware/authentication");

// 🔐 Protected routes

router.post("/create", authMiddleware, designationController.createDesignation);

router.get("/getAll", authMiddleware, designationController.getDesignations);

router.get("/getById/:id", authMiddleware, designationController.getDesignationById);

router.put("/update/:id", authMiddleware, designationController.updateDesignation);

router.delete("/delete/:id", authMiddleware, designationController.deleteDesignation);

module.exports = router;