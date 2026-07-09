const db = require("../config/db");

exports.applyOvertime = async (req, res) => {
    try {
        const { EmployeeId, Date, Hours } = req.body;
        const TenantId = req.user.tenantId;

        // ✅ Prevent duplicate entry
        const [existing] = await db.query(
            "SELECT * FROM overtime WHERE EmployeeId=? AND Date=? AND TenantId=?",
            [EmployeeId, Date, TenantId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Overtime already applied for this date"
            });
        }

        const [result] = await db.query(
            `INSERT INTO overtime 
      (TenantId, EmployeeId, Date, Hours, Status, CreatedAt)
      VALUES (?, ?, ?, ?, ?, NOW())`,
            [TenantId, EmployeeId, Date, Hours, "Pending"]
        );

        res.status(201).json({
            success: true,
            message: "Overtime request submitted successfully",
            data: {
                overtimeId: result.insertId,
                status: "Pending"
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOvertimeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { Status } = req.body; // Approved / Rejected
        const TenantId = req.user.tenantId;
        const ApprovedBy = req.user.id;

        const [rows] = await db.query(
            "SELECT * FROM overtime WHERE Id=? AND TenantId=?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Overtime request not found"
            });
        }

        await db.query(
            "UPDATE overtime SET Status=?, ApprovedBy=? WHERE Id=?",
            [Status, ApprovedBy, id]
        );

        res.json({
            success: true,
            message: `Overtime ${Status.toLowerCase()} successfully`,
            data: {
                overtimeId: id,
                status: Status
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOvertimeRequests = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT o.*, e.Name AS EmployeeName
       FROM overtime o
       JOIN employee e ON o.EmployeeId = e.Id
       WHERE o.TenantId = ?
       ORDER BY o.CreatedAt DESC`,
            [TenantId]
        );

        res.json({
            success: true,
            message: "Overtime requests fetched successfully",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOvertimeByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM overtime WHERE EmployeeId=? AND TenantId=?",
            [employeeId, TenantId]
        );

        res.json({
            success: true,
            message: "Employee overtime fetched",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ===============================
// Cancel Overtime Request
// ===============================
exports.cancelOvertimeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [request] = await db.query(
            `SELECT Id, Status
             FROM overtime
             WHERE Id = ? AND TenantId = ?`,
            [id, TenantId]
        );

        if (request.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Overtime request not found"
            });
        }

        if (String(request[0].Status).toLowerCase() !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending overtime requests can be cancelled"
            });
        }

        await db.query(
            `UPDATE overtime
             SET Status = ?
             WHERE Id = ? AND TenantId = ?`,
            ["Cancelled", id, TenantId]
        );

        res.status(200).json({
            success: true,
            message: "Overtime request cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
