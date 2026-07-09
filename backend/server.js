require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ================= ROUTES ================= */
// Example route
app.get("/", (req, res) => {
    res.send("API is running...");
});

const planRoutes = require("./routes/planRoutes")
const companyRoutes = require("./routes/companyRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const designationRoutes = require("./routes/designationRoutes")
const employeeRoutes = require("./routes/employeeRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const employeeShiftRoutes = require("./routes/employeeShiftRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const companyHolidayRoutes = require("./routes/companyHolidayRoutes");
const leaveTypeRoutes = require("./routes/leaveTypeRoutes");
const leaveBalanceRoutes = require("./routes/leaveBalanceRoutes");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes");
const wfhRoutes = require("./routes/wfhRoutes");
const overtimeRoutes = require("./routes/overtimeRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const adminRoutes = require("./routes/adminRoutes");



app.use("/plan", planRoutes)
app.use("/company", companyRoutes)
app.use("/department", departmentRoutes)
app.use("/designation", designationRoutes)
app.use("/employee", employeeRoutes);
app.use("/shift", shiftRoutes);
app.use("/employee-shift", employeeShiftRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/holidays", holidayRoutes);
app.use("/company-holidays", companyHolidayRoutes);
app.use("/leave-types", leaveTypeRoutes);
app.use("/leave-balance", leaveBalanceRoutes);
app.use("/leave-requests", leaveRequestRoutes);
app.use("/wfh", wfhRoutes);
app.use("/overtime", overtimeRoutes);
app.use("/users", userRoutes);
app.use("/settings", settingsRoutes);
app.use("/admin", adminRoutes);


/* ================= 404 HANDLER ================= */
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});