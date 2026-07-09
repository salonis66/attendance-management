const express = require("express");
const router = express.Router();

const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/authentication");

// 🔓 Public
router.post("/login", controller.loginUser);

// 🔐 Protected
router.post("/create", authMiddleware, controller.createUser);
router.get("/getAll", authMiddleware,controller.getUsers);
router.put("/update/", authMiddleware, controller.updateUser);
router.delete("/delete/", authMiddleware, controller.deleteUser);
router.get("/getById/", authMiddleware, controller.getUserById);

module.exports = router;