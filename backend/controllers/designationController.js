const db = require("../config/db");

// ✅ CREATE
exports.createDesignation = async (req, res) => {
    try {
        const { Name } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "INSERT INTO designation (TenantId, Name) VALUES (?, ?)",
            [TenantId, Name]
        );

        res.status(201).json({
            message: "Designation created successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL (only own tenant data)
exports.getDesignations = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM designation WHERE TenantId = ?",
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID (secure)
exports.getDesignationById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM designation WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Designation not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE
exports.updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "UPDATE designation SET Name = ? WHERE Id = ? AND TenantId = ?",
            [Name, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Designation not found or unauthorized"
            });
        }

        res.json({ message: "Designation updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM designation WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Designation not found or unauthorized"
            });
        }

        res.json({ message: "Designation deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};