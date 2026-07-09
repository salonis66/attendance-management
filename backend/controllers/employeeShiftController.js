const db = require("../config/db");

// ✅ ASSIGN SHIFT TO EMPLOYEE
exports.assignShift = async (req, res) => {
    try {
        const { EmployeeId, ShiftId, EffectiveFrom } = req.body;
        const TenantId = req.user.tenantId;

        // ✅ Check employee belongs to tenant
        const [emp] = await db.query(
            "SELECT * FROM employee WHERE Id = ? AND TenantId = ?",
            [EmployeeId, TenantId]
        );

        if (emp.length === 0) {
            return res.status(404).json({
                message: "Employee not found or unauthorized"
            });
        }

        // ✅ Insert mapping
        const [result] = await db.query(
            `INSERT INTO employeeshift (TenantId, EmployeeId, ShiftId, EffectiveFrom)
       VALUES (?, ?, ?, ?)`,
            [TenantId, EmployeeId, ShiftId, EffectiveFrom]
        );

        res.status(201).json({
            message: "Shift assigned successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL (Tenant Based)
exports.getEmployeeShifts = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT es.*, e.Name AS EmployeeName, s.Name AS ShiftName
       FROM employeeshift es
       JOIN employee e ON es.EmployeeId = e.Id
       JOIN shift s ON es.ShiftId = s.Id
       WHERE es.TenantId = ?`,
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getEmployeeShiftById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM employeeshift WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Record not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE
exports.updateEmployeeShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { EmployeeId, ShiftId, EffectiveFrom } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE employeeshift 
       SET EmployeeId=?, ShiftId=?, EffectiveFrom=? 
       WHERE Id=? AND TenantId=?`,
            [EmployeeId, ShiftId, EffectiveFrom, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found or unauthorized"
            });
        }

        res.json({ message: "Employee shift updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteEmployeeShift = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM employeeshift WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found or unauthorized"
            });
        }

        res.json({ message: "Employee shift deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};