const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper: normalize optional numeric fields
const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

// =========================
// REGISTER COMPANY
// =========================
exports.registerCompany = async (req, res) => {
  try {
    const {
      Name,
      Email,
      Phone,
      Address,
      ActivationKey,
      PlanId,
      MaxEmployees,
      Password,
      officeLatitude,
      officeLongitude,
      allowedRadius,
      wifiSSID,
      routerAddress
    } = req.body;

    if (!Name || !Email || !Password) {
      return res.status(400).json({
        message: "Name, Email and Password are required"
      });
    }

    const [existing] = await db.query(
      "SELECT TenantId FROM company WHERE Email = ?",
      [Email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await db.query(
      `INSERT INTO company (
        Name,
        Email,
        Phone,
        Address,
        ActivationKey,
        PlanId,
        MaxEmployees,
        officeLatitude,
        officeLongitude,
        allowedRadius,
        wifiSSID,
        routerAddress,
        CreatedAt,
        IsActive,
        Password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        Name,
        Email,
        Phone || null,
        Address || null,
        ActivationKey || null,
        PlanId || null,
        MaxEmployees || null,
        toNullableNumber(officeLatitude),
        toNullableNumber(officeLongitude),
        toNullableNumber(allowedRadius),
        wifiSSID || null,
        routerAddress || null,
        1,
        hashedPassword
      ]
    );

    const TenantId = result.insertId;

    const token = jwt.sign(
      {
        id: TenantId,
        tenantId: TenantId,
        email: Email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.header("Authorization", `Bearer ${token}`);

    res.status(201).json({
      message: "Company registered successfully",
      token,
      company: {
        TenantId,
        Name,
        Email,
        officeLatitude,
        officeLongitude,
        allowedRadius,
        wifiSSID,
        routerAddress
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// LOGIN COMPANY
// =========================
exports.loginCompany = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM company WHERE Email = ?",
      [Email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const company = rows[0];

    const isMatch = await bcrypt.compare(Password, company.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: company.Id,
        tenantId: company.TenantId,
        email: company.Email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.header("Authorization", `Bearer ${token}`);

    res.json({
      message: "Login successful",
      token,
      company: {
        TenantId: company.TenantId,
        Name: company.Name,
        Email: company.Email,
        officeLatitude: company.officeLatitude,
        officeLongitude: company.officeLongitude,
        allowedRadius: company.allowedRadius,
        wifiSSID: company.wifiSSID,
        routerAddress: company.routerAddress
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// GET ALL COMPANIES
// =========================
exports.getAllCompanies = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM company ORDER BY TenantId DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// GET COMPANY BY TENANT ID
// =========================
exports.getCompanyByTenantId = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM company WHERE TenantId = ?",
      [tenantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// UPDATE COMPANY
// =========================
exports.updateCompany = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const {
      Name,
      Email,
      Phone,
      Address,
      ActivationKey,
      PlanId,
      MaxEmployees,
      IsActive,
      officeLatitude,
      officeLongitude,
      allowedRadius,
      wifiSSID,
      routerAddress
    } = req.body;

    const [result] = await db.query(
      `UPDATE company SET
        Name = ?,
        Email = ?,
        Phone = ?,
        Address = ?,
        ActivationKey = ?,
        PlanId = ?,
        MaxEmployees = ?,
        IsActive = ?,
        officeLatitude = ?,
        officeLongitude = ?,
        allowedRadius = ?,
        wifiSSID = ?,
        routerAddress = ?
      WHERE TenantId = ?`,
      [
        Name,
        Email,
        Phone || null,
        Address || null,
        ActivationKey || null,
        PlanId || null,
        MaxEmployees || null,
        IsActive,
        toNullableNumber(officeLatitude),
        toNullableNumber(officeLongitude),
        toNullableNumber(allowedRadius),
        wifiSSID || null,
        routerAddress || null,
        tenantId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// DELETE COMPANY
// =========================
exports.deleteCompany = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const [result] = await db.query(
      "DELETE FROM company WHERE TenantId = ?",
      [tenantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
