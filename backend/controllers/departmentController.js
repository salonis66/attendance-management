const db = require("../config/db");

// ✅ CREATE
exports.createDepartment = async (req, res) => {
    try {
        const { Name } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "INSERT INTO department (TenantId, Name) VALUES (?, ?)",
            [TenantId, Name]
        );

        res.status(201).json({
            message: "Department created successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL (ONLY LOGGED-IN COMPANY DATA)
exports.getDepartments = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM department WHERE TenantId = ?",
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID (WITH TENANT SECURITY)
exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM department WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE (ONLY OWN TENANT DATA)
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "UPDATE department SET Name = ? WHERE Id = ? AND TenantId = ?",
            [Name, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Department not found or unauthorized"
            });
        }

        res.json({ message: "Department updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE (ONLY OWN TENANT DATA)
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM department WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Department not found or unauthorized"
            });
        }

        res.json({ message: "Department deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};