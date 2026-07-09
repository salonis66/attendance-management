const db = require("../config/db");

// ✅ CREATE
exports.createLeaveType = async (req, res) => {
    try {
        const { Name, MaxPerYear, IsCarryForward } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `INSERT INTO leavetype (TenantId, Name, MaxPerYear, IsCarryForward)
       VALUES (?, ?, ?, ?)`,
            [TenantId, Name, MaxPerYear, IsCarryForward ?? 0]
        );

        res.status(201).json({
            message: "Leave type created successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL (Tenant Based)
exports.getLeaveTypes = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM leavetype WHERE TenantId = ?",
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getLeaveTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM leavetype WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Leave type not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE
exports.updateLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, MaxPerYear, IsCarryForward } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE leavetype 
       SET Name=?, MaxPerYear=?, IsCarryForward=? 
       WHERE Id=? AND TenantId=?`,
            [Name, MaxPerYear, IsCarryForward, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Leave type not found or unauthorized"
            });
        }

        res.json({ message: "Leave type updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM leavetype WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Leave type not found or unauthorized"
            });
        }

        res.json({ message: "Leave type deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};