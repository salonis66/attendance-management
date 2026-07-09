const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
    try {
        const { Name, Phone, Password } = req.body;

        if (!Name || !Phone || !Password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // ✅ check existing
        const [existing] = await db.query(
            "SELECT * FROM admin WHERE Phone=?",
            [Phone]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists"
            });
        }

        // ✅ hash password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // ✅ insert admin
        const [result] = await db.query(
            `INSERT INTO admin (Name, Phone, PasswordHash, CreatedAt)
             VALUES (?, ?, ?, NOW())`,
            [Name, Phone, hashedPassword]
        );

        // ✅ create token
        const token = jwt.sign(
            {
                id: result.insertId,
                phone: Phone
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ send token in header
        res.header("Authorization", `Bearer ${token}`);

        // ✅ response
        res.json({
            success: true,
            message: "Admin register successful",
            token,
            data: {
                adminId: result.insertId,
                name: Name,
                phone: Phone
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { Phone, Password } = req.body;

        // ✅ find admin
        const [rows] = await db.query(
            "SELECT * FROM admin WHERE Phone=?",
            [Phone]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone or password"
            });
        }

        const admin = rows[0];

        // ✅ compare password
        const isMatch = await bcrypt.compare(Password, admin.PasswordHash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone or password"
            });
        }

        // ✅ generate token
        const token = jwt.sign(
            {
                id: admin.Id,
                role: "Admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 🔥 send token in HEADER (important for app)
        res.header("Authorization", `Bearer ${token}`);

        res.json({
            success: true,
            message: "Admin login successful",
            token, // 🔥 ADD THIS LINE
            data: {
                adminId: admin.Id,
                name: admin.Name,
                phone: admin.Phone
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== GET ALL ADMINS ======================
exports.getAllAdmins = async (req, res) => {
    try {
        const [admins] = await db.query(`
            SELECT Id, Name, Phone, CreatedAt
            FROM admin
            ORDER BY Id DESC
        `);

        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ====================== GET ADMIN BY ID ======================
exports.getAdminById = async (req, res) => {
    try {
        const { id } = req.params;

        const [admin] = await db.query(
            `SELECT Id, Name, Phone, CreatedAt
             FROM admin
             WHERE Id = ?`,
            [id]
        );

        if (admin.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        res.status(200).json({
            success: true,
            data: admin[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ====================== UPDATE ADMIN ======================
exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, Phone, Password } = req.body;

        // check admin exists
        const [admin] = await db.query(
            "SELECT * FROM admin WHERE Id = ?",
            [id]
        );

        if (admin.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // check phone duplicate (if changed)
        if (Phone) {
            const [existing] = await db.query(
                "SELECT * FROM admin WHERE Phone = ? AND Id != ?",
                [Phone, id]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Phone already in use"
                });
            }
        }

        let hashedPassword = admin[0].PasswordHash;

        // update password only if provided
        if (Password) {
            if (Password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters"
                });
            }

            hashedPassword = await bcrypt.hash(Password, 10);
        }

        await db.query(
            `UPDATE admin 
             SET Name = ?, Phone = ?, PasswordHash = ?
             WHERE Id = ?`,
            [
                Name || admin[0].Name,
                Phone || admin[0].Phone,
                hashedPassword,
                id
            ]
        );

        res.status(200).json({
            success: true,
            message: "Admin updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ====================== DELETE ADMIN ======================
exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // check admin exists
        const [admin] = await db.query(
            "SELECT * FROM admin WHERE Id = ?",
            [id]
        );

        if (admin.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        await db.query(
            "DELETE FROM admin WHERE Id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Admin deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};