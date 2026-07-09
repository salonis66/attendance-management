const express = require("express");
const router = express.Router();
const adminAuth=require("../middleware/adminAuth.js")

const planController = require("../controllers/planController");

// CREATE
router.post("/create",adminAuth,planController.createPlan);

// GET ALL
router.get("/getAll",adminAuth,planController.getAllPlans);

// GET BY ID
router.get("/getById/:id",adminAuth, planController.getPlanById);

// UPDATE
router.put("/update/:id",adminAuth, planController.updatePlan);

// DELETE
router.delete("/delete/:id",adminAuth,planController.deletePlan);

module.exports = router;