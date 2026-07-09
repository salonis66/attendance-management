const db = require("../config/db");

// ✅ ASSIGN HOLIDAY TO COMPANY
exports.assignHoliday = async (req, res) => {
    try {
        const { HolidayId, IsActive } = req.body;
        const TenantId = req.user.tenantId;

        // ✅ Check holiday exists
        const [holiday] = await db.query(
            "SELECT * FROM holidaymaster WHERE Id = ?",
            [HolidayId]
        );

        if (holiday.length === 0) {
            return res.status(404).json({
                message: "Holiday not found"
            });
        }

        // ✅ Prevent duplicate
        const [existing] = await db.query(
            "SELECT * FROM companyholiday WHERE TenantId=? AND HolidayId=?",
            [TenantId, HolidayId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Holiday already assigned"
            });
        }

        // ✅ Insert
        const [result] = await db.query(
            `INSERT INTO companyholiday (TenantId, HolidayId, IsActive)
       VALUES (?, ?, ?)`,
            [TenantId, HolidayId, IsActive ?? 1]
        );

        res.status(201).json({
            message: "Holiday assigned successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL COMPANY HOLIDAYS
exports.getCompanyHolidays = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT ch.*, h.Name, h.Date, h.CountryCode, h.IsOptional
       FROM companyholiday ch
       JOIN holidaymaster h ON ch.HolidayId = h.Id
       WHERE ch.TenantId = ?`,
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getCompanyHolidayById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT * FROM companyholiday 
       WHERE Id = ? AND TenantId = ?`,
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

// ✅ UPDATE (Activate/Deactivate)
exports.updateCompanyHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { IsActive } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE companyholiday 
       SET IsActive=? 
       WHERE Id=? AND TenantId=?`,
            [IsActive, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found or unauthorized"
            });
        }

        res.json({ message: "Updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteCompanyHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM companyholiday WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found or unauthorized"
            });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};