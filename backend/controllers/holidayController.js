const db = require("../config/db");

// ✅ CREATE HOLIDAY
exports.createHoliday = async (req, res) => {
    try {
        const { Name, Date, CountryCode, IsOptional } = req.body;

        const [result] = await db.query(
            `INSERT INTO holidaymaster (Name, Date, CountryCode, IsOptional)
       VALUES (?, ?, ?, ?)`,
            [Name, Date, CountryCode, IsOptional ?? 0]
        );

        res.status(201).json({
            message: "Holiday created successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL HOLIDAYS
exports.getHolidays = async (req, res) => {
    try {
        const { country } = req.query;

        let query = "SELECT * FROM holidaymaster";
        let params = [];

        if (country) {
            query += " WHERE CountryCode = ?";
            params.push(country);
        }

        const [rows] = await db.query(query, params);

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getHolidayById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM holidaymaster WHERE Id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Holiday not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE
exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, Date, CountryCode, IsOptional } = req.body;

        const [result] = await db.query(
            `UPDATE holidaymaster 
       SET Name=?, Date=?, CountryCode=?, IsOptional=? 
       WHERE Id=?`,
            [Name, Date, CountryCode, IsOptional, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Holiday not found"
            });
        }

        res.json({ message: "Holiday updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM holidaymaster WHERE Id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Holiday not found"
            });
        }

        res.json({ message: "Holiday deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};