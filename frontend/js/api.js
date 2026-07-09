/* =============================================
   api.js - Central API Utility
   Matches exact backend API contract
   ============================================= */

const BASE_URL = 'https://attedance.gymgurus.in';

/**
 * Core fetch wrapper — attaches JWT, handles errors globally
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  showLoading();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (res.status === 401) {
      showToast('Session expired. Please login again.', 'error');
      logout();
      return null;
    }

    if (!res.ok) {
      const msg = data?.message || data?.error || `Error ${res.status}`;
      showToast(msg, 'error');
      return null;
    }

    return data;
  } catch (err) {
    showToast('Network error. Is the server running?', 'error');
    return null;
  } finally {
    hideLoading();
  }
}

/* ── AUTH ──
   POST /company/login
   Body: { "Email": "...", "Password": "..." }
   Response: { "message": "Login successful", "token": "..." }
*/
async function apiLogin(email, password) {
  showLoading();
  try {
    const res = await fetch(`${BASE_URL}/company/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Password: password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || 'Login failed');
    return data;
  } catch (err) {
    showToast(err.message, 'error');
    return null;
  } finally {
    hideLoading();
  }
}

/* ── COMPANY ──
   GET  /company/getbyId/:tenantId
   Response: { TenantId, Name, Email, Phone, Address, PlanId, MaxEmployees, ... }
*/
const Company = {
  getById: (id) => apiFetch(`/company/getbyId/${id}`),
  update:  (id, body) => apiFetch(`/company/update/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

/* ── EMPLOYEES ──
   GET    /employee/getAll
   Response: [ { Id, TenantId, EmployeeCode, Name, Email, Phone,
                 DepartmentId, DesignationId, DateOfJoining, IsActive,
                 DepartmentName, DesignationName } ]

   POST   /employee/create
   Body:  { EmployeeCode, Name, Email, Phone, DepartmentId,
            DesignationId, DateOfJoining, IsActive }

   PUT    /employee/update/:id
   DELETE /employee/delete/:id
*/
const Employees = {
  getAll:  ()         => apiFetch('/employee/getAll'),
  getById: (id)       => apiFetch(`/employee/getById/${id}`),
  create:  (body)     => apiFetch('/employee/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/employee/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/employee/delete/${id}`, { method: 'DELETE' }),
};

/* ── DEPARTMENTS ──
   GET    /department/getAll
   Response: [ { Id, TenantId, Name } ]

   POST   /department/create      Body: { Name }
   PUT    /department/update/:id  Body: { Name }
   DELETE /department/delete/:id
*/
const Departments = {
  getAll:  ()         => apiFetch('/department/getAll'),
  create:  (body)     => apiFetch('/department/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/department/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/department/delete/${id}`, { method: 'DELETE' }),
};

/* ── DESIGNATIONS ──
   GET    /designation/getAll
   Response: [ { Id, TenantId, Name } ]

   POST   /designation/create      Body: { Name }
   PUT    /designation/update/:id  Body: { Name }
   DELETE /designation/delete/:id
*/
const Designations = {
  getAll:  ()         => apiFetch('/designation/getAll'),
  create:  (body)     => apiFetch('/designation/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/designation/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/designation/delete/${id}`, { method: 'DELETE' }),
};

/* ── SHIFTS ──
   GET    /shift/getAll
   Response: [ { Id, TenantId, Name, StartTime, EndTime, GraceMinutes } ]

   POST   /shift/create      Body: { Name, StartTime, EndTime, GraceMinutes }
   PUT    /shift/update/:id
   DELETE /shift/delete/:id
*/
const Shifts = {
  getAll:  ()         => apiFetch('/shift/getAll'),
  getById: (id)       => apiFetch(`/shift/getById/${id}`),
  create:  (body)     => apiFetch('/shift/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/shift/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/shift/delete/${id}`, { method: 'DELETE' }),
};

/* ── EMPLOYEE SHIFTS ──
   GET    /employee-shift/getAll
   Response: [ { Id, TenantId, EmployeeId, ShiftId, EffectiveFrom, EmployeeName, ShiftName } ]

   POST   /employee-shift/create   Body: { EmployeeId, ShiftId, EffectiveFrom }
   PUT    /employee-shift/update/:id
   DELETE /employee-shift/delete/:id
*/
const EmployeeShifts = {
  getAll:  ()         => apiFetch('/employee-shift/getAll'),
  create:  (body)     => apiFetch('/employee-shift/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/employee-shift/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/employee-shift/delete/${id}`, { method: 'DELETE' }),
};

/* ── ATTENDANCE ──
   GET /attendance/getAll
   Response: [ { Id, TenantId, EmployeeId, Date, CheckInTime,
                 CheckOutTime, StatusCode, EmployeeName } ]
   StatusCode: "PRESENT" = present, anything else = absent
*/
const Attendance = {
  getAll:    ()   => apiFetch('/attendance/getAll'),
  getByEmp:  (id) => apiFetch(`/attendance/getById/${id}`),
};

/* ── MASTER HOLIDAYS (read-only list to pick from) ──
   GET /holidays/getAll
   Response: [ { Id, Name, Date, CountryCode, IsOptional } ]
*/
const MasterHolidays = {
  getAll:  ()   => apiFetch('/holidays/getAll'),
  getById: (id) => apiFetch(`/holidays/getById/${id}`),
};

/* ── COMPANY HOLIDAYS (assigned holidays for tenant) ──
   GET    /company-holidays/getAll
   Response: [ { Id, Name, Date, CountryCode, IsOptional } ]
             (returns master holiday list enriched with assignment status)

   POST   /company-holidays/create    Body: { HolidayId, IsActive: 1 }
   GET    /company-holidays/getById/:id  → { Id, TenantId, HolidayId, IsActive }
   PUT    /company-holidays/update/:id   Body: { IsActive: 0/1 }
   DELETE /holidays/delete/:id
*/
const CompanyHolidays = {
  getAll:  ()         => apiFetch('/holidays/getAll'),
   getAllCompany:  ()         => apiFetch('/company-holidays/getAll'),
  getByIdCompany: (id)       => apiFetch(`/company-holidays/getById/${id}`),
  assign:  (body)     => apiFetch('/company-holidays/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/company-holidays/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/company-holidays/delete/${id}`,         { method: 'DELETE' }),
};

/* ── LEAVE TYPES ──
   GET    /leave-types/getAll
   Response: [ { Id, TenantId, Name, MaxPerYear, IsCarryForward } ]

   POST   /leave-types/create    Body: { Name, MaxPerYear, IsCarryForward }
   PUT    /leave-types/update/:id
   DELETE /leave-types/delete/:id
*/
const LeaveTypes = {
  getAll:  ()         => apiFetch('/leave-types/getAll'),
  getById: (id)       => apiFetch(`/leave-types/getById/${id}`),
  create:  (body)     => apiFetch('/leave-types/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body) => apiFetch(`/leave-types/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:  (id)       => apiFetch(`/leave-types/delete/${id}`, { method: 'DELETE' }),
};

/* ── LEAVE BALANCE ──
   GET    /leave-balance/getAll
   Response: [ { Id, TenantId, EmployeeId, LeaveTypeId, Year,
                 TotalAllocated, Used, Remaining, EmployeeName, LeaveType } ]

   POST   /leave-balance/create    Body: { EmployeeId, LeaveTypeId, Year, TotalAllocated }
   PUT    /leave-balance/update/:id
   DELETE /leave-balance/delete/:id
*/
const LeaveBalance = {
  getAll:    ()         => apiFetch('/leave-balance/getAll'),
  getByEmp:  (id)       => apiFetch(`/leave-balance/getById/${id}`),
  create:    (body)     => apiFetch('/leave-balance/create',      { method: 'POST',   body: JSON.stringify(body) }),
  update:    (id, body) => apiFetch(`/leave-balance/update/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  delete:    (id)       => apiFetch(`/leave-balance/delete/${id}`, { method: 'DELETE' }),
};

/* ── LEAVE REQUESTS ──
   GET /leave-requests/getAll
   Response: { message, count, data: [ { Id, EmployeeId, EmployeeName,
               LeaveTypeId, LeaveType, FromDate, ToDate, TotalDays,
               Reason, Status, ApprovedBy, CreatedAt } ] }

   PUT /leave-requests/:id/status
   Approve body: { StatusId: 2 }   Reject body: { StatusId: 3 }
   Response: { success, message, data: { leaveId, status, approvedBy } }
*/
const LeaveRequests = {
  getAll:       ()         => apiFetch('/leave-requests/getAll'),
  getByEmp:     (id)       => apiFetch(`/leave-requests/employee/${id}`),
  updateStatus: (id, body) => apiFetch(`/leave-requests/update/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  
};

/* ── WFH REQUESTS ──
   GET /wfh/getAll
   Response: { success, message, count, data: [ { Id, TenantId,
               EmployeeId, Date, Reason, Status, CreatedAt, EmployeeName } ] }

   PUT /wfh/:id/status
   Body: { Status: "Approved" } or { Status: "Rejected" }
*/
const WFHRequests = {
  getAll:       ()         => apiFetch('/wfh/getAll'),
  getByEmp:     (id)       => apiFetch(`/wfh/employee/${id}`),
  updateStatus: (id, body) => apiFetch(`/wfh/update/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
};

/* ── OVERTIME REQUESTS ──
   GET /overtime/getAll
   Response: { success, message, count, data: [ { Id, TenantId,
               EmployeeId, Date, Hours, Status, ApprovedBy,
               CreatedAt, EmployeeName } ] }

   PUT /overtime/update/:id/status
   Body: { Status: "Approved" } or { Status: "Rejected" }
*/
const OvertimeRequests = {
  getAll:       ()         => apiFetch('/overtime/getAll'),
  getByEmp:     (id)       => apiFetch(`/overtime/employee/${id}`),
  updateStatus: (id, body) => apiFetch(`/overtime/update/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
};