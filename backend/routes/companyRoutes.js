const express = require("express");
const router = express.Router();
const adminAuth=require("../middleware/adminAuth.js")

const companyController = require("../controllers/companyController");
const authMiddleware = require("../middleware/authentication");

// CREATE
router.post("/register",adminAuth,companyController.registerCompany);
router.post("/login",companyController.loginCompany);

// GET ALL
router.get("/getAll",adminAuth,companyController.getAllCompanies);

// GET BY TENANT ID
router.get(
    "/getById/:tenantId",
    authMiddleware,
    companyController.getCompanyByTenantId
);

// UPDATE
router.put(
    "/update/:tenantId",
    authMiddleware,
    companyController.updateCompany
);

// DELETE
router.delete(
    "/delete/:tenantId",
    authMiddleware,
    companyController.deleteCompany
);


module.exports = router;