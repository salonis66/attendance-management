const db = require("../config/db");

// ✅ CREATE
exports.createEmployee = async (req, res) => {
    try {
        const {
            EmployeeCode,
            Name,
            Email,
            Phone,
            DepartmentId,
            DesignationId,
            DateOfJoining,
            IsActive
        } = req.body;

        const TenantId = req.user.tenantId;

        // ✅ Check required fields
        if (!EmployeeCode || !Name || !DepartmentId || !DesignationId || !DateOfJoining) {
            return res.status(400).json({
                message: "EmployeeCode, Name, DepartmentId, DesignationId and DateOfJoining are required"
            });
        }

        // ✅ Check department exists for this company
        const [department] = await db.query(
            "SELECT Id FROM department WHERE Id = ? AND TenantId = ?",
            [DepartmentId, TenantId]
        );

        if (department.length === 0) {
            return res.status(400).json({
                message: "Department does not exist for this company"
            });
        }

        // ✅ Check designation exists for this company
        const [designation] = await db.query(
            "SELECT Id FROM designation WHERE Id = ? AND TenantId = ?",
            [DesignationId, TenantId]
        );

        if (designation.length === 0) {
            return res.status(400).json({
                message: "Designation does not exist for this company"
            });
        }

        // ✅ Check duplicate employee code in same company
        const [existingEmployee] = await db.query(
            "SELECT Id FROM employee WHERE EmployeeCode = ? AND TenantId = ?",
            [EmployeeCode, TenantId]
        );

        if (existingEmployee.length > 0) {
            return res.status(400).json({
                message: "Employee code already exists"
            });
        }

        // ✅ Insert employee
        const [result] = await db.query(
            `INSERT INTO employee 
            (TenantId, EmployeeCode, Name, Email, Phone, DepartmentId, DesignationId, DateOfJoining, IsActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                TenantId,
                EmployeeCode,
                Name,
                Email,
                Phone,
                DepartmentId,
                DesignationId,
                DateOfJoining,
                IsActive ?? 1
            ]
        );

        res.status(201).json({
            message: "Employee created successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating employee",
            error: error.message
        });
    }
};






// ✅ GET ALL (ONLY OWN TENANT DATA)
exports.getEmployees = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT e.*, d.Name AS DepartmentName, des.Name AS DesignationName
       FROM employee e
       LEFT JOIN department d ON e.DepartmentId = d.Id
       LEFT JOIN designation des ON e.DesignationId = des.Id
       WHERE e.TenantId = ?`,
            [TenantId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ GET BY ID
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            "SELECT * FROM employee WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ UPDATE
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            EmployeeCode,
            Name,
            Email,
            Phone,
            DepartmentId,
            DesignationId,
            DateOfJoining,
            IsActive
        } = req.body;

        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE employee SET 
        EmployeeCode=?, Name=?, Email=?, Phone=?, 
        DepartmentId=?, DesignationId=?, DateOfJoining=?, IsActive=?
       WHERE Id=? AND TenantId=?`,
            [
                EmployeeCode,
                Name,
                Email,
                Phone,
                DepartmentId,
                DesignationId,
                DateOfJoining,
                IsActive,
                id,
                TenantId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found or unauthorized"
            });
        }

        res.json({ message: "Employee updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ DELETE
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const TenantId = req.user.tenantId;

        // ✅ Check if employee exists
        const [employee] = await db.query(
            "SELECT Id FROM employee WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                message: "Employee not found or unauthorized"
            });
        }

        // ✅ Soft delete (set status = 0)
        await db.query(
            "UPDATE employee SET isActive = 0 WHERE Id = ? AND TenantId = ?",
            [id, TenantId]
        );

        res.json({ message: "Employee soft deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};