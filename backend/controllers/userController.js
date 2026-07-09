const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ CREATE USER
exports.createUser = async (req, res) => {
    try {
        const { EmployeeId, Username, Password, Role } = req.body;
        const TenantId = req.user.tenantId;
    
        // Required fields validation
        if (!EmployeeId || !Username || !Password || !Role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Password validation
        if (Password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check employee exists
        const [emp] = await db.query(
            "SELECT * FROM employee WHERE Id=? AND TenantId=?",
            [EmployeeId, TenantId]
        );

        if (emp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid EmployeeId"
            });
        }

        // Check employee already has account
        const [existingEmpUser] = await db.query(
            "SELECT * FROM user WHERE EmployeeId=? AND TenantId=?",
            [EmployeeId, TenantId]
        );

        if (existingEmpUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already exists for this employee"
            });
        }

        // Check username unique
        const [existing] = await db.query(
            "SELECT * FROM user WHERE Username=? AND TenantId=?",
            [Username, TenantId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const [result] = await db.query(
            `INSERT INTO user 
            (TenantId, EmployeeId, Username, PasswordHash, Role, IsActive)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [TenantId, EmployeeId, Username.trim(), hashedPassword, Role, 1]
        );

        // Generate JWT for newly created user
        const token = jwt.sign(
            {
                id: result.insertId,
                tenantId: TenantId,
                role: Role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            token,
            data: {
                userId: result.insertId,
                employeeId: EmployeeId,
                username: Username,
                role: Role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.loginUser = async (req, res) => {
    try {
        const { Username, Password } = req.body;

        const [rows] = await db.query(
            "SELECT * FROM user WHERE Username=? AND IsActive=1",
            [Username]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(Password, user.PasswordHash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // ✅ generate token
        const token = jwt.sign(
            {
                 id: user.Id,
                tenantId: user.TenantId,
                role: user.Role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.header("Authorization", `Bearer ${token}`);

        res.json({
            success: true,
            message: "Login successful",
            token,
            data: {
                userId: user.Id,
                role: user.Role
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const TenantId = req.user.tenantId;

        const [rows] = await db.query(
            `SELECT u.*, e.Name AS EmployeeName
       FROM user u
       JOIN employee e ON u.EmployeeId = e.Id
       WHERE u.TenantId=?`,
            [TenantId]
        );

        res.json({
            success: true,
            message: "Users fetched successfully",
            count: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User By Id
exports.getUserById = async (req, res) => {
    try {
        console.log(req.user)
        const  id  = req.user.id;
        const TenantId = req.user.tenantId;

        const [user] = await db.query(
            `SELECT 
                u.Id,
                u.EmployeeId,
                u.Username,
                u.Role,
                u.IsActive,
                e.Name AS EmployeeName,
                e.Email,
                e.Phone,
                e.DepartmentId,
                e.DesignationId
            FROM user u
            LEFT JOIN employee e ON u.EmployeeId = e.Id
            WHERE u.Id = ? AND u.TenantId = ?`,
            [id, TenantId]
        );

       

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
         const  id  = req.user.id;
        const { Role, IsActive } = req.body;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            `UPDATE user SET Role=?, IsActive=? 
       WHERE Id=? AND TenantId=?`,
            [Role, IsActive, id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User updated successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
         const id  = req.user.id;
        const TenantId = req.user.tenantId;

        const [result] = await db.query(
            "DELETE FROM user WHERE Id=? AND TenantId=?",
            [id, TenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};