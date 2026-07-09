const db = require("../config/db");

// ✅ APPLY LEAVE
exports.applyLeave = async (req, res) => {
    try {
        const {
            EmployeeId,
            LeaveTypeId,
            FromDate,
            ToDate,
            Reason
        } = req.body;

        const TenantId = req.user.tenantId;

        // ✅ Calculate total days
        const from = new Date(FromDate);
        const to = new Date(ToDate);
        const TotalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        // ✅ Check leave balance
        const [balance] = await db.query(
            `SELECT * FROM leavebalance 
       WHERE EmployeeId=? AND LeaveTypeId=? AND TenantId=?`,
            [EmployeeId, LeaveTypeId, TenantId]
        );

        if (balance.length === 0) {
            return res.status(400).json({
                message: "Leave balance not found"
            });
        }

        if (balance[0].Remaining < TotalDays) {
            return res.status(400).json({
                message: "Insufficient leave balance"
            });
        }
        console.log(balance[0])

        // ✅ Insert leave request
        const [result] = await db.query(
            `INSERT INTO leaverequest 
      (TenantId, EmployeeId, LeaveTypeId, FromDate, ToDate, TotalDays, Reason, StatusId, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                TenantId,
                EmployeeId,
                LeaveTypeId,
                FromDate,
                ToDate,
                TotalDays,
                Reason,
                1,
            ]
        );

        res.status(201).json({
            message: "Leave applied successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { StatusId } = req.body; // 2=Approved, 3=Rejected

        const TenantId = req.user.tenantId;
        const ApprovedBy = req.user.id;

        // ✅ Get leave request
        const [rows] = await db.query(
            "SELECT * FROM leaverequest WHERE Id=? AND TenantId=?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        const leave = rows[0];

        // ✅ If approving → deduct leave balance
        if (StatusId == 2) {
            await db.query(
                `UPDATE leavebalance 
         SET Used = Used + ?, Remaining = Remaining - ?
         WHERE EmployeeId=? AND LeaveTypeId=? AND TenantId=?`,
                [
                    leave.TotalDays,
                    leave.TotalDays,
                    leave.EmployeeId,
                    leave.LeaveTypeId,
                    TenantId
                ]
            );
        }

        // ✅ Update status
        await db.query(
            `UPDATE leaverequest 
       SET StatusId=?, ApprovedBy=? 
       WHERE Id=?`,
            [StatusId, ApprovedBy, id]
        );

        res.json({
            message: "Leave status updated"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLeaveRequests = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT lr.*, e.Name AS EmployeeName, lt.Name AS LeaveType
       FROM leaverequest lr
       JOIN employee e ON lr.EmployeeId = e.Id
       JOIN leavetype lt ON lr.LeaveTypeId = lt.Id
       WHERE lr.TenantId = ?
       ORDER BY lr.CreatedAt DESC`,
            [TenantId]
        );

        res.json({
            success: true,
            message: "Leave requests fetched successfully",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getLeaveByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT 
                lr.Id,
                lr.EmployeeId,
                lt.Name AS leaveTypeName,
                lr.FromDate,
                lr.ToDate,
                lr.TotalDays,
                lr.Reason,
                lr.StatusId,
                lr.CreatedAt
            FROM leaverequest lr
            JOIN leavetype lt 
                ON lr.LeaveTypeId = lt.Id 
                AND lr.TenantId = lt.TenantId
            WHERE lr.EmployeeId = ? 
              AND lr.TenantId = ?`,
            [employeeId, TenantId]
        );

        res.json({
            success: true,
            message: "Employee leave requests fetched",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params; // Leave Request ID
        const TenantId = req.user.tenantId;

        // Check if leave request exists and belongs to tenant
        const [leaveRequest] = await db.query(
            `SELECT Id, StatusId 
             FROM leaverequest
             WHERE Id = ? AND TenantId = ?`,
            [id, TenantId]
        );

        if (leaveRequest.length === 0) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        // Allow cancel only if status is Pending (StatusId = 1)
        if (leaveRequest[0].StatusId !== 1) {
            return res.status(400).json({
                message: "Only pending leave requests can be cancelled"
            });
        }

        // Update status to Cancelled (example StatusId = 4)
        await db.query(
            `UPDATE leaverequest
             SET StatusId = ?
             WHERE Id = ? AND TenantId = ?`,
            [4, id, TenantId]
        );

        res.status(200).json({
            message: "Leave request cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};