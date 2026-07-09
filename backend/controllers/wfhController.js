const db = require("../config/db");

exports.applyWFH = async (req, res) => {
    try {
        const { EmployeeId, Date, Reason } = req.body;
        const TenantId = req.user.tenantId;

        // ✅ Prevent duplicate request for same date
        const [existing] = await db.query(
            "SELECT * FROM wfhrequest WHERE EmployeeId=? AND Date=? AND TenantId=?",
            [EmployeeId, Date, TenantId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "WFH already applied for this date"
            });
        }

        const [result] = await db.query(
            `INSERT INTO wfhrequest 
      (TenantId, EmployeeId, Date, Reason, Status, CreatedAt)
      VALUES (?, ?, ?, ?, ?, NOW())`,
            [TenantId, EmployeeId, Date, Reason, "Pending"]
        );

        res.status(201).json({
            success: true,
            message: "WFH request submitted successfully",
            data: {
                wfhId: result.insertId,
                status: "Pending"
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateWFHStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { Status } = req.body; // Approved / Rejected
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM wfhrequest WHERE Id=? AND TenantId=?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "WFH request not found"
            });
        }

        await db.query(
            "UPDATE wfhrequest SET Status=? WHERE Id=?",
            [Status, id]
        );

        res.json({
            success: true,
            message: `WFH ${Status.toLowerCase()} successfully`,
            data: {
                wfhId: id,
                status: Status
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWFHRequests = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT w.*, e.Name AS EmployeeName
       FROM wfhrequest w
       JOIN employee e ON w.EmployeeId = e.Id
       WHERE w.TenantId = ?
       ORDER BY w.CreatedAt DESC`,
            [TenantId]
        );

        res.json({
            success: true,
            message: "WFH requests fetched successfully",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWFHByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM wfhrequest WHERE EmployeeId=? AND TenantId=?",
            [employeeId, TenantId]
        );

        res.json({
            success: true,
            message: "Employee WFH fetched",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===============================
// Cancel WFH Request
// ===============================
exports.cancelWFHRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [request] = await db.query(
            `SELECT Id, Status
             FROM wfhrequest
             WHERE Id = ? AND TenantId = ?`,
            [id, TenantId]
        );

        if (request.length === 0) {
            return res.status(404).json({
                success: false,
                message: "WFH request not found"
            });
        }

        if (String(request[0].Status).toLowerCase() !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending WFH requests can be cancelled"
            });
        }

        await db.query(
            `UPDATE wfhrequest
             SET Status = ?
             WHERE Id = ? AND TenantId = ?`,
            ["Cancelled", id, TenantId]
        );

        res.status(200).json({
            success: true,
            message: "WFH request cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};