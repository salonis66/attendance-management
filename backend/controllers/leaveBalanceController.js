const db = require("../config/db");

// ✅ CREATE / ALLOCATE LEAVE
exports.createLeaveBalance = async (req, res) => {
    try {
        const {
            EmployeeId,
            LeaveTypeId,
            Year,
            TotalAllocated
        } = req.body;

        const TenantId = req.user.tenantId;

        // ✅ Prevent duplicate for same year
        const [existing] = await db.query(
            `SELECT * FROM leavebalance 
       WHERE EmployeeId=? AND LeaveTypeId=? AND Year=? AND TenantId=?`,
            [EmployeeId, LeaveTypeId, Year, TenantId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Leave already allocated for this year"
            });
        }

        const Remaining = TotalAllocated;

        const [result] = await db.query(
            `INSERT INTO leavebalance 
       (TenantId, EmployeeId, LeaveTypeId, Year, TotalAllocated, Used, Remaining)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                TenantId,
                EmployeeId,
                LeaveTypeId,
                Year,
                TotalAllocated,
                0,
                Remaining
            ]
        );

        res.status(201).json({
            message: "Leave balance created",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET ALL (Tenant Based)
exports.getLeaveBalances = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT lb.*, e.Name AS EmployeeName, lt.Name AS LeaveType
       FROM leavebalance lb
       JOIN employee e ON lb.EmployeeId = e.Id
       JOIN leavetype lt ON lb.LeaveTypeId = lt.Id
       WHERE lb.TenantId = ?`,
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY EMPLOYEE
exports.getLeaveBalanceByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT 
                lb.Id,
                lb.EmployeeId,
                lt.Name AS leaveTypeName,
                lb.TotalAllocated,
                lb.Used,
                lb.Remaining
            FROM leavebalance lb
            JOIN leavetype lt 
                ON lb.LeaveTypeId = lt.Id 
                AND lb.TenantId = lt.TenantId
            WHERE lb.EmployeeId = ? 
              AND lb.TenantId = ?`,
            [employeeId, TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE (Adjust Balance)
exports.updateLeaveBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { TotalAllocated, Used, Remaining } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE leavebalance 
       SET TotalAllocated=?, Used=?, Remaining=? 
       WHERE Id=? AND TenantId=?`,
            [TotalAllocated, Used, Remaining, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found or unauthorized"
            });
        }

        res.json({ message: "Leave balance updated" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteLeaveBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM leavebalance WHERE Id=? AND TenantId=?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found"
            });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};