const db = require("../config/db");

// ✅ CREATE
exports.createPlan = async (req, res) => {
    try {
        const { Name, MaxEmployees, Price, FeaturesJson } = req.body;

        const [result] = await db.query(
            `INSERT INTO plan (Name, MaxEmployees, Price, FeaturesJson)
       VALUES (?, ?, ?, ?)`,
            [
                Name,
                MaxEmployees,
                Price,
                JSON.stringify(FeaturesJson) // store as JSON string
            ]
        );

        res.status(201).json({
            message: "Plan created successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL
exports.getAllPlans = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM plan");

        // convert JSON string to object
        const plans = rows.map(plan => ({
            ...plan,
            FeaturesJson: JSON.parse(plan.FeaturesJson || "{}")
        }));

        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getPlanById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM plan WHERE Id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const plan = rows[0];
        plan.FeaturesJson = JSON.parse(plan.FeaturesJson || "{}");

        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, MaxEmployees, Price, FeaturesJson } = req.body;

        const [result] = await db.query(
            `UPDATE plan 
       SET Name=?, MaxEmployees=?, Price=?, FeaturesJson=? 
       WHERE Id=?`,
            [
                Name,
                MaxEmployees,
                Price,
                JSON.stringify(FeaturesJson),
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.json({ message: "Plan updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM plan WHERE Id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.json({ message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};