const db = require("../config/db");

// ✅ CREATE SHIFT
exports.createShift = async (req, res) => {
    try {
        const { Name, StartTime, EndTime, GraceMinutes } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `INSERT INTO shift (TenantId, Name, StartTime, EndTime, GraceMinutes)
       VALUES (?, ?, ?, ?, ?)`,
            [TenantId, Name, StartTime, EndTime, GraceMinutes]
        );

        res.status(201).json({
            message: "Shift created successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL SHIFTS
exports.getShifts = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM shift WHERE TenantId = ?",
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getShiftById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM shift WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE SHIFT
exports.updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, StartTime, EndTime, GraceMinutes } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE shift 
       SET Name=?, StartTime=?, EndTime=?, GraceMinutes=? 
       WHERE Id=? AND TenantId=?`,
            [Name, StartTime, EndTime, GraceMinutes, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Shift not found or unauthorized"
            });
        }

        res.json({ message: "Shift updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE SHIFT
exports.deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM shift WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Shift not found or unauthorized"
            });
        }

        res.json({ message: "Shift deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};