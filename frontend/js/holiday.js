/* =============================================
   holidays.js
   Covers: Company Holidays, Leave Types, Leave Balance,
           Leave Requests, WFH Requests, Overtime Requests
   ============================================= */

/* ═══════════════════════════════════════
   COMPANY HOLIDAYS
   /company-holidays/getAll returns master list:
   [ { Id, Name, Date, CountryCode, IsOptional } ]

   Assign: POST /company-holidays/create  { HolidayId, IsActive: 1 }
   Toggle: PUT  /company-holidays/update/:id  { IsActive: 0/1 }
═══════════════════════════════════════ */

let allHolidays = [];

async function loadHolidays() {
  const [all, company] = await Promise.all([
    CompanyHolidays.getAll(),        // 👉 ALL holidays
    CompanyHolidays.getAllCompany()  // 👉 COMPANY holidays
  ]);

  renderAllHolidays(all || []);
  renderCompanyHolidays(company || []);
}

function renderAllHolidays(data) {
  const tbody = document.getElementById('holidayTbody');

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="3">No holidays found</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(h => `
    <tr>
      <td>${esc(h.Name)}</td>
      <td>${fmtDate(h.Date)}</td>
      <td>
        <button class="btn btn-sm btn-primary"
          onclick="addToCompanyHoliday(${h.Id})">
          +
        </button>
      </td>
    </tr>
  `).join('');
}

function renderCompanyHolidays(data) {
  const tbody = document.getElementById('companyHolidayTbody');
  const activeHolidays = (data || []).filter(h => Number(h.IsActive) === 1);

  if (!activeHolidays.length) {
    tbody.innerHTML = `<tr><td colspan="3">No company holidays</td></tr>`;
    return;
  }

  tbody.innerHTML = activeHolidays.map(h => `
    <tr>
      <td>${esc(h.Name)}</td>
      <td>${fmtDate(h.Date)}</td>
      <td>
        <button class="btn btn-sm btn-danger"
          onclick="removeCompanyHoliday(${h.Id})">
          Remove
        </button>
      </td>
    </tr>
  `).join('');
}

async function addToCompanyHoliday(id) {
  const res = await CompanyHolidays.assign({
    HolidayId: id,
    IsActive: 1
  });

  if (res) {
    showToast("Holiday added to company!");
    loadHolidays();
  }
}
async function removeCompanyHoliday(id) {
  if (!confirmDelete('Remove this holiday from the company calendar?')) return;
  const res = await CompanyHolidays.delete(id);

  if (res) {
    showToast("Holiday removed!");
    loadHolidays();
  }
}
// async function assignHoliday(holidayId, name) {
//   if (!confirm(`Assign "${name}" to this company's calendar?`)) return;
//   // POST /company-holidays/create { HolidayId: 1, IsActive: 1 }
//   const r = await CompanyHolidays.assign({ HolidayId: holidayId, IsActive: 1 });
//   if (r) showToast(`"${name}" assigned to company calendar!`);
// }

// async function deleteHoliday(id) {
//   if (!confirmDelete('Delete this holiday?')) return;
//   // DELETE /holidays/delete/:id
//   const r = await CompanyHolidays.delete(id);
//   if (r) { showToast('Holiday deleted'); await loadHolidays(); }
// }

/* ═══════════════════════════════════════
   LEAVE TYPES
   Response: [ { Id, TenantId, Name, MaxPerYear, IsCarryForward } ]
   Create/Update body: { Name, MaxPerYear, IsCarryForward }
═══════════════════════════════════════ */

let allLeaveTypes    = [];
let editingLTId      = null;

async function loadLeaveTypes() {
  const data = await LeaveTypes.getAll();
  allLeaveTypes = Array.isArray(data) ? data : [];
  renderLeaveTypeTable(allLeaveTypes);
}

function renderLeaveTypeTable(types) {
  const tbody = document.getElementById('leaveTypeTbody');
  if (!tbody) return;

  if (!types.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><i class="bi bi-file-earmark-text"></i><p>No leave types found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = types.map(t => `
    <tr>
      <td><strong>${esc(t.Name)}</strong></td>
      <td>
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;">
          ${t.MaxPerYear ?? '—'} days/year
        </span>
      </td>
      <td>
        ${t.IsCarryForward
          ? '<span class="badge-custom badge-success">Yes</span>'
          : '<span class="badge-custom badge-secondary">No</span>'}
      </td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" onclick="openEditLeaveType(${t.Id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-sm-icon btn-delete" onclick="deleteLeaveType(${t.Id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddLeaveType() {
  editingLTId = null;
  document.getElementById('leaveTypeModalTitle').textContent = 'Add Leave Type';
  document.getElementById('leaveTypeForm').reset();
  new bootstrap.Modal(document.getElementById('leaveTypeModal')).show();
}

function openEditLeaveType(id) {
  editingLTId = id;
  const lt = allLeaveTypes.find(t => t.Id === id);
  if (!lt) return;
  document.getElementById('leaveTypeModalTitle').textContent = 'Edit Leave Type';
  document.getElementById('ltName').value         = lt.Name          || '';
  document.getElementById('ltMaxPerYear').value   = lt.MaxPerYear    ?? '';
  document.getElementById('ltCarryForward').value = String(lt.IsCarryForward ?? 0);
  new bootstrap.Modal(document.getElementById('leaveTypeModal')).show();
}

async function saveLeaveType() {
  const body = {
    Name:           document.getElementById('ltName').value.trim(),
    MaxPerYear:     parseInt(document.getElementById('ltMaxPerYear').value)   || null,
    IsCarryForward: parseInt(document.getElementById('ltCarryForward').value) || 0,
  };
  if (!body.Name) { showToast('Leave type name is required', 'error'); return; }

  const result = editingLTId
    ? await LeaveTypes.update(editingLTId, body)
    : await LeaveTypes.create(body);

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('leaveTypeModal'))?.hide();
    showToast(editingLTId ? 'Leave type updated!' : 'Leave type added!');
    await loadLeaveTypes();
  }
}

async function deleteLeaveType(id) {
  if (!confirmDelete('Delete this leave type?')) return;
  const r = await LeaveTypes.delete(id);
  if (r) { showToast('Leave type deleted'); await loadLeaveTypes(); }
}

/* ═══════════════════════════════════════
   LEAVE BALANCE
   Response: [ { Id, TenantId, EmployeeId, LeaveTypeId, Year,
                 TotalAllocated, Used, Remaining, EmployeeName, LeaveType } ]
   Create/Update body: { EmployeeId, LeaveTypeId, Year, TotalAllocated }
═══════════════════════════════════════ */

let allLeaveBalances = [];
let editingLBId      = null;

async function loadLeaveBalances() {
  const [balData, empData, ltData] = await Promise.all([
    LeaveBalance.getAll(),
    Employees.getAll(),
    LeaveTypes.getAll(),
  ]);

  allLeaveBalances = Array.isArray(balData) ? balData : [];
  const emps = Array.isArray(empData) ? empData : [];
  const lts  = Array.isArray(ltData)  ? ltData  : [];

  // Populate dropdowns
  const empSel = document.getElementById('lbEmployee');
  const ltSel  = document.getElementById('lbLeaveType');

  if (empSel) {
    empSel.innerHTML = '<option value="">Select Employee</option>' +
      emps.map(e => `<option value="${e.Id}">${esc(e.Name)} (${esc(e.EmployeeCode)})</option>`).join('');
  }
  if (ltSel) {
    ltSel.innerHTML = '<option value="">Select Leave Type</option>' +
      lts.map(t => `<option value="${t.Id}">${esc(t.Name)}</option>`).join('');
  }

  renderLeaveBalTable(allLeaveBalances);
}

function renderLeaveBalTable(balances) {
  const tbody = document.getElementById('leaveBalTbody');
  if (!tbody) return;

  if (!balances.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><i class="bi bi-bar-chart"></i><p>No leave balances found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = balances.map(b => `
    <tr>
      <td><strong>${esc(b.EmployeeName)}</strong></td>
      <td>${esc(b.LeaveType)}</td>
      <td>
        <span style="font-family:'JetBrains Mono',monospace;">${b.Year}</span>
      </td>
      <td>${b.TotalAllocated ?? '—'}</td>
      <td>${b.Used ?? 0}</td>
      <td>
        <span class="badge-custom ${(b.Remaining || 0) > 0 ? 'badge-success' : 'badge-danger'}">
          ${b.Remaining ?? 0}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" onclick="openEditLeaveBal(${b.Id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-sm-icon btn-delete" onclick="deleteLeaveBal(${b.Id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddLeaveBal() {
  editingLBId = null;
  document.getElementById('leaveBalModalTitle').textContent = 'Add Leave Balance';
  document.getElementById('leaveBalForm').reset();
  document.getElementById('lbYear').value = new Date().getFullYear();
  new bootstrap.Modal(document.getElementById('leaveBalModal')).show();
}

function openEditLeaveBal(id) {
  editingLBId = id;
  const lb = allLeaveBalances.find(b => b.Id === id);
  if (!lb) return;
  document.getElementById('leaveBalModalTitle').textContent = 'Edit Leave Balance';
  document.getElementById('lbEmployee').value  = lb.EmployeeId  || '';
  document.getElementById('lbLeaveType').value = lb.LeaveTypeId || '';
  document.getElementById('lbYear').value      = lb.Year        || new Date().getFullYear();
  document.getElementById('lbAllocated').value = lb.TotalAllocated || '';
  new bootstrap.Modal(document.getElementById('leaveBalModal')).show();
}

async function saveLeaveBal() {
  const body = {
    EmployeeId:     parseInt(document.getElementById('lbEmployee').value)  || null,
    LeaveTypeId:    parseInt(document.getElementById('lbLeaveType').value) || null,
    Year:           parseInt(document.getElementById('lbYear').value),
    TotalAllocated: parseInt(document.getElementById('lbAllocated').value),
  };
  if (!body.EmployeeId || !body.LeaveTypeId || !body.Year || !body.TotalAllocated) {
    showToast('All fields are required', 'error'); return;
  }

  const result = editingLBId
    ? await LeaveBalance.update(editingLBId, body)
    : await LeaveBalance.create(body);

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('leaveBalModal'))?.hide();
    showToast(editingLBId ? 'Balance updated!' : 'Balance added!');
    await loadLeaveBalances();
  }
}

async function deleteLeaveBal(id) {
  if (!confirmDelete('Delete this leave balance?')) return;
  const r = await LeaveBalance.delete(id);
  if (r) { showToast('Leave balance deleted'); await loadLeaveBalances(); }
}

/* ═══════════════════════════════════════
   REQUEST MANAGEMENT
   Tabs: Leave | WFH | Overtime
═══════════════════════════════════════ */

let currentRequestTab = 'leave';

async function loadRequests(tab) {
  currentRequestTab = tab || currentRequestTab;

  // Update tab active state
  document.querySelectorAll('.custom-tab[data-req-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.reqTab === currentRequestTab);
  });

  // Show/hide tables
  document.getElementById('leaveReqTable').style.display    = currentRequestTab === 'leave'    ? '' : 'none';
  document.getElementById('wfhReqTable').style.display      = currentRequestTab === 'wfh'      ? '' : 'none';
  document.getElementById('overtimeReqTable').style.display = currentRequestTab === 'overtime' ? '' : 'none';

  if (currentRequestTab === 'leave')    await loadLeaveRequests();
  if (currentRequestTab === 'wfh')      await loadWFHRequests();
  if (currentRequestTab === 'overtime') await loadOvertimeRequests();
}

/* ── Leave Requests ──
   Response: { message, count, data: [ { Id, EmployeeId, EmployeeName,
               LeaveTypeId, LeaveType, FromDate, ToDate, TotalDays,
               Reason, Status, ApprovedBy, CreatedAt } ] }
   Approve: PUT /leave-requests/:id/status  { StatusId: 2 }
   Reject:  PUT /leave-requests/:id/status  { StatusId: 3 }
*/
async function loadLeaveRequests() {
  const res = await LeaveRequests.getAll();
  // Wrapped response: { message, count, data: [...] }
  const requests = res?.data || [];
  const tbody = document.getElementById('leaveReqTbody');
  if (!tbody) return;

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><i class="bi bi-inbox"></i><p>No leave requests</p></div>
    </td></tr>`;
    return;
  }


  tbody.innerHTML = requests.map(r => `
    <tr>
      <td><strong>${esc(r.EmployeeName)}</strong></td>
      <td>${esc(r.LeaveType)}</td>
      <td>${fmtDate(r.FromDate)}</td>
      <td>${fmtDate(r.ToDate)}</td>
      <td>
        <span class="badge-custom badge-info">${r.TotalDays ?? '—'} day(s)</span>
      </td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${esc(r.Reason)}">${esc(r.Reason) || '—'}</td>
      <td>${statusBadge(r.StatusId)}</td>
      <td>${leaveReqActions(r.Id, r.StatusId)}</td>
    </tr>
  `).join('');
}

/* ── WFH Requests ──
   Response: { success, message, count, data: [ { Id, TenantId,
               EmployeeId, Date, Reason, Status, CreatedAt, EmployeeName } ] }
   Approve/Reject: PUT /wfh/:id/status  { Status: "Approved"/"Rejected" }
*/
async function loadWFHRequests() {
  const res = await WFHRequests.getAll();
  const requests = res?.data || [];
  const tbody = document.getElementById('wfhReqTbody');
  if (!tbody) return;

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><i class="bi bi-inbox"></i><p>No WFH requests</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = requests.map(r => `
    <tr>
      <td><strong>${esc(r.EmployeeName)}</strong></td>
      <td>${fmtDate(r.Date)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${esc(r.Reason)}">${esc(r.Reason) || '—'}</td>
      <td>${statusBadge(r.Status)}</td>
      <td>${genericReqActions(r.Id, r.Status, 'wfh')}</td>
    </tr>
  `).join('');
}

/* ── Overtime Requests ──
   Response: { success, message, count, data: [ { Id, TenantId,
               EmployeeId, Date, Hours, Status, ApprovedBy,
               CreatedAt, EmployeeName } ] }
   Approve/Reject: PUT /overtime/update/:id/status  { Status: "Approved"/"Rejected" }
*/
async function loadOvertimeRequests() {
  const res = await OvertimeRequests.getAll();
  const requests = res?.data || [];
  const tbody = document.getElementById('overtimeReqTbody');
  if (!tbody) return;

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state"><i class="bi bi-inbox"></i><p>No overtime requests</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = requests.map(r => `
    <tr>
      <td><strong>${esc(r.EmployeeName)}</strong></td>
      <td>${fmtDate(r.Date)}</td>
      <td>
        <span class="badge-custom badge-info">${r.Hours ?? '—'} hrs</span>
      </td>
      <td>${statusBadge(r.Status)}</td>
      <td>${genericReqActions(r.Id, r.Status, 'overtime')}</td>
    </tr>
  `).join('');
}

/* ── Helpers ── */
// function statusBadge(status) {
//   const s = (status || '').toLowerCase();
//   if (s === 'approved') return '<span class="badge-custom badge-success">Approved</span>';
//   if (s === 'rejected') return '<span class="badge-custom badge-danger">Rejected</span>';
//   return '<span class="badge-custom badge-warning">Pending</span>';
// }

function statusBadge(status) {
  let label = "Pending";

  if (typeof status === "number") {
    if (status === 1) label = "Pending";
    else if (status === 2) label = "Approved";
    else if (status === 3) label = "Rejected";
    else if (status === 4) label = "Cancelled";
  } else {
    const s = String(status || "").toLowerCase();

    if (s === "approved") label = "Approved";
    else if (s === "rejected") label = "Rejected";
    else if (s === "cancelled") label = "Cancelled";
    else label = "Pending";
  }

  const cls =
    label === "Approved"
      ? "badge-success"
      : label === "Rejected"
      ? "badge-danger"
      : label === "Cancelled"
      ? "badge-secondary"
      : "badge-warning";

  return `<span class="badge-custom ${cls}">${label}</span>`;
}


function leaveReqActions(id, status) {
  let label = "Pending";

  if (typeof status === "number") {
    if (status === 1) label = "Pending";
    else if (status === 2) label = "Approved";
    else if (status === 3) label = "Rejected";
    else if (status === 4) label = "Cancelled";
  } else {
    const s = String(status || "").toLowerCase();

    if (s === "approved") label = "Approved";
    else if (s === "rejected") label = "Rejected";
    else if (s === "cancelled") label = "Cancelled";
    else label = "Pending";
  }

  const s = label.toLowerCase();

  // If already processed, no action buttons
  if (s === "approved" || s === "rejected" || s === "cancelled") {
    return '<span class="badge-custom badge-secondary">Closed</span>';
  }

  return `
    <div style="display:flex;gap:4px;">
      <button class="btn-sm-icon btn-approve" title="Approve"
        onclick="handleLeaveRequest(${id}, 'approve')">
        <i class="bi bi-check-lg"></i>
      </button>

      <button class="btn-sm-icon btn-reject" title="Reject"
        onclick="handleLeaveRequest(${id}, 'reject')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;
}

function genericReqActions(id, status, type) {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'rejected') {
    return '<span class="badge-custom badge-secondary">Closed</span>';
  }
  return `
    <div style="display:flex;gap:4px;">
      <button class="btn-sm-icon btn-approve" title="Approve"
        onclick="handleRequest(${id},'Approved','${type}')">
        <i class="bi bi-check-lg"></i>
      </button>
      <button class="btn-sm-icon btn-reject" title="Reject"
        onclick="handleRequest(${id},'Rejected','${type}')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>`;
}

// Leave approve/reject uses StatusId (2=Approved, 3=Rejected)
async function handleLeaveRequest(id, action) {
  if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this leave request?`)) return;
  const body = { StatusId: action === 'approve' ? 2 : 3 };
  const result = await LeaveRequests.updateStatus(id, body);
  if (result) {
    showToast(`Leave request ${action}d!`);
    await loadLeaveRequests();
  }
}

// WFH and Overtime use { Status: "Approved"/"Rejected" }
async function handleRequest(id, status, type) {
  const action = status === 'Approved' ? 'approve' : 'reject';
  if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this request?`)) return;

  const body = { Status: status };
  let result;
  if (type === 'wfh')      result = await WFHRequests.updateStatus(id, body);
  if (type === 'overtime') result = await OvertimeRequests.updateStatus(id, body);

  if (result) {
    showToast(`Request ${action}d!`);
    await loadRequests(currentRequestTab);
  }
}