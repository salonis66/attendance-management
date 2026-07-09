const db = require("../config/db");

// ✅ CREATE / UPDATE
exports.saveMultipleSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        const TenantId = req.user.tenantId;

        const values = Object.keys(settings).map(key => [
            TenantId,
            key,
            settings[key]
        ]);

        await db.query(
            `INSERT INTO settings (TenantId, setting_key, setting_value)
             VALUES ?
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [values]
        );

        res.json({
            success: true,
            message: "Settings saved (bulk upsert) successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT setting_key, setting_value FROM settings WHERE TenantId=?",
            [TenantId]
        );

        // convert to key-value object 🔥
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        res.json({
            success: true,
            message: "Settings fetched successfully",
            data: settings
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM settings WHERE TenantId=? AND setting_key=?",
            [TenantId, key]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Setting not found"
            });
        }

        res.json({
            success: true,
            message: "Setting fetched",
            data: rows[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM settings WHERE TenantId=? AND setting_key=?",
            [TenantId, key]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Setting not found"
            });
        }

        res.json({
            success: true,
            message: "Setting deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};