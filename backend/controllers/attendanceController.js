const db = require("../config/db");

// =========================
// Helper: Calculate distance in meters (Haversine)
// =========================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// =========================
// Helper: Validate office attendance rules
// =========================
const validateAttendanceRules = async (
  TenantId,
  currentLatitude,
  currentLongitude,
  wifiSSID,
  routerAddress
) => {
  const [companyRows] = await db.query(
    `SELECT officeLatitude, officeLongitude, allowedRadius, wifiSSID, routerAddress
     FROM company WHERE TenantId = ?`,
    [TenantId]
  );

  if (companyRows.length === 0) {
    return { valid: false, message: "Company not found" };
  }

  const company = companyRows[0];

  // Location validation
  if (
    company.officeLatitude &&
    company.officeLongitude &&
    company.allowedRadius &&
    currentLatitude &&
    currentLongitude
  ) {
    const distance = calculateDistance(
      Number(company.officeLatitude),
      Number(company.officeLongitude),
      Number(currentLatitude),
      Number(currentLongitude)
    );

    if (distance > Number(company.allowedRadius)) {
      return {
        valid: false,
        message: `You are outside office range. Distance: ${Math.round(distance)}m`
      };
    }
  }

  // Wi-Fi validation
  if (company.wifiSSID && wifiSSID && company.wifiSSID !== wifiSSID) {
    return {
      valid: false,
      message: "You are not connected to office Wi-Fi"
    };
  }

  if (
    company.routerAddress &&
    routerAddress &&
    company.routerAddress !== routerAddress
  ) {
    return {
      valid: false,
      message: "Router does not match office network"
    };
  }

  return { valid: true };
};

// =========================
// CHECK-IN
// =========================
exports.checkIn = async (req, res) => {
    console.log(req.user,req.params);
  try {
    const { EmployeeId}=req.params;
    const {
      currentLatitude,
      currentLongitude,
      wifiSSID,
      routerAddress
    } = req.body;

    const TenantId = req.user.tenantId;

    

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];

    const [emp] = await db.query(
      "SELECT * FROM employee WHERE Id = ? AND TenantId = ?",
      [EmployeeId, TenantId]
    );

    if (emp.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const validation = await validateAttendanceRules(
      TenantId,
      currentLatitude,
      currentLongitude,
      wifiSSID,
      routerAddress
    );

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const [existing] = await db.query(
      "SELECT * FROM attendance WHERE EmployeeId = ? AND Date = ? AND TenantId = ?",
      [EmployeeId, today, TenantId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const [result] = await db.query(
      `INSERT INTO attendance (
        TenantId,
        EmployeeId,
        Date,
        CheckInTime,
        StatusCode,
        CheckInLatitude,
        CheckInLongitude,
        CheckInWifiSSID,
        CheckInRouterAddress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TenantId,
        EmployeeId,
        today,
        now,
        "PRESENT",
        currentLatitude || null,
        currentLongitude || null,
        wifiSSID || null,
        routerAddress || null
      ]
    );

    res.json({
      message: "Check-in successful",
      id: result.insertId,
      time: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// CHECK-OUT
// =========================
exports.checkOut = async (req, res) => {

  try {
    const { EmployeeId}=req.params;
    const {
      
      currentLatitude,
      currentLongitude,
      wifiSSID,
      routerAddress
    } = req.body;

    const TenantId = req.user.tenantId;

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];

    const validation = await validateAttendanceRules(
      TenantId,
      currentLatitude,
      currentLongitude,
      wifiSSID,
      routerAddress
    );

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const [rows] = await db.query(
      "SELECT * FROM attendance WHERE EmployeeId = ? AND Date = ? AND TenantId = ?",
      [EmployeeId, today, TenantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Check-in not found" });
    }

    const attendance = rows[0];

    if (attendance.CheckOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    await db.query(
      `UPDATE attendance SET
        CheckOutTime = ?,
        CheckOutLatitude = ?,
        CheckOutLongitude = ?,
        CheckOutWifiSSID = ?,
        CheckOutRouterAddress = ?
      WHERE Id = ?`,
      [
        now,
        currentLatitude || null,
        currentLongitude || null,
        wifiSSID || null,
        routerAddress || null,
        attendance.Id
      ]
    );

    res.json({
      message: "Check-out successful",
      time: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// GET ALL ATTENDANCE
// =========================
exports.getAttendance = async (req, res) => {
  try {
    const TenantId = req.user.tenantId;

    const [rows] = await db.query(
      `SELECT a.*, e.Name AS EmployeeName
       FROM attendance a
       JOIN employee e ON a.EmployeeId = e.Id
       WHERE a.TenantId = ?
       ORDER BY a.Date DESC`,
      [TenantId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// GET BY EMPLOYEE
// =========================
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const TenantId = req.user.tenantId;

    const [rows] = await db.query(
      `SELECT * FROM attendance
       WHERE EmployeeId = ? AND TenantId = ?
       ORDER BY Date DESC`,
      [employeeId, TenantId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// DELETE ATTENDANCE
// =========================
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const TenantId = req.user.tenantId;

    const [result] = await db.query(
      "DELETE FROM attendance WHERE Id = ? AND TenantId = ?",
      [id, TenantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Attendance deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
