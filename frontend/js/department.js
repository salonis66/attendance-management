/* =============================================
   department.js
   Covers: Department, Designation, Shift, Employee-Shift CRUD
   All getAll APIs return plain arrays with { Id, Name, ... }
   ============================================= */

/* ═══════════════════════════════════════
   DEPARTMENTS
   Response: [ { Id, TenantId, Name } ]
═══════════════════════════════════════ */

let allDepartments = [];
let editingDeptId  = null;

async function loadDepartments() {
  const data = await Departments.getAll();
  allDepartments = Array.isArray(data) ? data : [];
  renderDeptTable(allDepartments);
}

function renderDeptTable(departments) {
  const tbody = document.getElementById('deptTbody');
  if (!tbody) return;

  if (!departments.length) {
    tbody.innerHTML = `<tr><td colspan="3">
      <div class="empty-state"><i class="bi bi-building"></i><p>No departments found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = departments.map(d => `
    <tr>
      <td>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;
          background:#f3f4f6;padding:3px 8px;border-radius:6px;">#${d.Id}</span>
      </td>
      <td><strong>${esc(d.Name)}</strong></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" onclick="openEditDept(${d.Id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-sm-icon btn-delete" onclick="deleteDept(${d.Id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddDept() {
  editingDeptId = null;
  document.getElementById('deptModalTitle').textContent = 'Add Department';
  document.getElementById('deptForm').reset();
  new bootstrap.Modal(document.getElementById('deptModal')).show();
}

function openEditDept(id) {
  editingDeptId = id;
  const dept = allDepartments.find(d => d.Id === id);
  if (!dept) return;
  document.getElementById('deptModalTitle').textContent = 'Edit Department';
  document.getElementById('deptName').value = dept.Name || '';
  new bootstrap.Modal(document.getElementById('deptModal')).show();
}

async function saveDept() {
  const body = { Name: document.getElementById('deptName').value.trim() };
  if (!body.Name) { showToast('Department name is required', 'error'); return; }

  const result = editingDeptId
    ? await Departments.update(editingDeptId, body)
    : await Departments.create(body);

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('deptModal'))?.hide();
    showToast(editingDeptId ? 'Department updated!' : 'Department added!');
    await loadDepartments();
  }
}

async function deleteDept(id) {
  if (!confirmDelete('Delete this department?')) return;
  const r = await Departments.delete(id);
  if (r) { showToast('Department deleted'); await loadDepartments(); }
}

/* ═══════════════════════════════════════
   DESIGNATIONS
   Response: [ { Id, TenantId, Name } ]
═══════════════════════════════════════ */

let allDesignations = [];
let editingDesigId  = null;

async function loadDesignations() {
  const data = await Designations.getAll();
  allDesignations = Array.isArray(data) ? data : [];
  renderDesigTable(allDesignations);
}

function renderDesigTable(designations) {
  const tbody = document.getElementById('desigTbody');
  if (!tbody) return;

  if (!designations.length) {
    tbody.innerHTML = `<tr><td colspan="3">
      <div class="empty-state"><i class="bi bi-award"></i><p>No designations found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = designations.map(d => `
    <tr>
      <td>
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;
          background:#f3f4f6;padding:3px 8px;border-radius:6px;">#${d.Id}</span>
      </td>
      <td><strong>${esc(d.Name)}</strong></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" onclick="openEditDesig(${d.Id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-sm-icon btn-delete" onclick="deleteDesig(${d.Id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddDesig() {
  editingDesigId = null;
  document.getElementById('desigModalTitle').textContent = 'Add Designation';
  document.getElementById('desigForm').reset();
  new bootstrap.Modal(document.getElementById('desigModal')).show();
}

function openEditDesig(id) {
  editingDesigId = id;
  const desig = allDesignations.find(d => d.Id === id);
  if (!desig) return;
  document.getElementById('desigModalTitle').textContent = 'Edit Designation';
  document.getElementById('desigName').value = desig.Name || '';
  new bootstrap.Modal(document.getElementById('desigModal')).show();
}

async function saveDesig() {
  const body = { Name: document.getElementById('desigName').value.trim() };
  if (!body.Name) { showToast('Designation name is required', 'error'); return; }

  const result = editingDesigId
    ? await Designations.update(editingDesigId, body)
    : await Designations.create(body);

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('desigModal'))?.hide();
    showToast(editingDesigId ? 'Designation updated!' : 'Designation added!');
    await loadDesignations();
  }
}

async function deleteDesig(id) {
  if (!confirmDelete('Delete this designation?')) return;
  const r = await Designations.delete(id);
  if (r) { showToast('Designation deleted'); await loadDesignations(); }
}

/* ═══════════════════════════════════════
   SHIFTS
   Response: [ { Id, TenantId, Name, StartTime, EndTime, GraceMinutes } ]
═══════════════════════════════════════ */

let allShifts    = [];
let editingShiftId = null;

async function loadShifts() {
  const data = await Shifts.getAll();
  allShifts = Array.isArray(data) ? data : [];
  renderShiftTable(allShifts);
}

function renderShiftTable(shifts) {
  const tbody = document.getElementById('shiftTbody');
  if (!tbody) return;

  if (!shifts.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><i class="bi bi-clock"></i><p>No shifts found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = shifts.map(s => `
    <tr>
      <td><strong>${esc(s.Name)}</strong></td>
      <td>
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;">
          ${esc(s.StartTime)}
        </span>
      </td>
      <td>
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;">
          ${esc(s.EndTime)}
        </span>
      </td>
      <td>
        <span class="badge-custom badge-info">${s.GraceMinutes ?? 0} min</span>
      </td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" onclick="openEditShift(${s.Id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-sm-icon btn-delete" onclick="deleteShift(${s.Id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddShift() {
  editingShiftId = null;
  document.getElementById('shiftModalTitle').textContent = 'Add Shift';
  document.getElementById('shiftForm').reset();
  new bootstrap.Modal(document.getElementById('shiftModal')).show();
}

function openEditShift(id) {
  editingShiftId = id;
  const shift = allShifts.find(s => s.Id === id);
  if (!shift) return;
  document.getElementById('shiftModalTitle').textContent = 'Edit Shift';
  document.getElementById('shiftName').value  = shift.Name         || '';
  document.getElementById('shiftStart').value = shift.StartTime    || '';
  document.getElementById('shiftEnd').value   = shift.EndTime      || '';
  document.getElementById('shiftGrace').value = shift.GraceMinutes ?? 0;
  new bootstrap.Modal(document.getElementById('shiftModal')).show();
}

async function saveShift() {
  const body = {
    Name:         document.getElementById('shiftName').value.trim(),
    StartTime:    document.getElementById('shiftStart').value,
    EndTime:      document.getElementById('shiftEnd').value,
    GraceMinutes: parseInt(document.getElementById('shiftGrace').value) || 0,
  };
  if (!body.Name || !body.StartTime || !body.EndTime) {
    showToast('Name, Start Time and End Time are required', 'error'); return;
  }

  const result = editingShiftId
    ? await Shifts.update(editingShiftId, body)
    : await Shifts.create(body);

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('shiftModal'))?.hide();
    showToast(editingShiftId ? 'Shift updated!' : 'Shift added!');
    await loadShifts();
  }
}

async function deleteShift(id) {
  if (!confirmDelete('Delete this shift?')) return;
  const r = await Shifts.delete(id);
  if (r) { showToast('Shift deleted'); await loadShifts(); }
}

/* ═══════════════════════════════════════
   EMPLOYEE SHIFTS (Assign shift to employee)
   Response: [ { Id, TenantId, EmployeeId, ShiftId,
                 EffectiveFrom, EmployeeName, ShiftName } ]
═══════════════════════════════════════ */

let allEmpShifts     = [];
let editingEmpShiftId = null;

async function loadEmpShifts() {
  const [esData, empData, shiftData] = await Promise.all([
    EmployeeShifts.getAll(),
    Employees.getAll(),
    Shifts.getAll(),
  ]);

  allEmpShifts = Array.isArray(esData) ? esData : [];
  const emps   = Array.isArray(empData)   ? empData   : [];
  const shifts = Array.isArray(shiftData) ? shiftData : [];

  // Populate dropdowns
  const empSel   = document.getElementById('esEmployee');
  const shiftSel = document.getElementById('esShift');
  if (empSel) {
    empSel.innerHTML = '<option value="">Select Employee</option>' +
      emps.map(e => `<option value="${e.Id}">${esc(e.Name)} (${esc(e.EmployeeCode)})</option>`).join('');
  }
  if (shiftSel) {
    shiftSel.innerHTML = '<option value="">Select Shift</option>' +
      shifts.map(s => `<option value="${s.Id}">${esc(s.Name)}</option>`).join('');
  }

  renderEmpShiftTable(allEmpShifts);
}

function renderEmpShiftTable(records) {
  const tbody = document.getElementById('empShiftTbody');
  if (!tbody) return;

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><i class="bi bi-person-badge"></i><p>No shift assignments found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td><strong>${esc(r.EmployeeName)}</strong></td>
      <td>${esc(r.ShiftName)}</td>
      <td>${fmtDate(r.EffectiveFrom)}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" onclick="openEditEmpShift(${r.Id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-sm-icon btn-delete" onclick="deleteEmpShift(${r.Id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function openAddEmpShift() {
  editingEmpShiftId = null;
  document.getElementById('empShiftModalTitle').textContent = 'Assign Shift to Employee';
  document.getElementById('empShiftForm').reset();
  new bootstrap.Modal(document.getElementById('empShiftModal')).show();
}

function openEditEmpShift(id) {
  editingEmpShiftId = id;
  const rec = allEmpShifts.find(r => r.Id === id);
  if (!rec) return;
  document.getElementById('empShiftModalTitle').textContent = 'Edit Shift Assignment';
  document.getElementById('esEmployee').value      = rec.EmployeeId   || '';
  document.getElementById('esShift').value         = rec.ShiftId      || '';
  document.getElementById('esEffectiveFrom').value =
    (rec.EffectiveFrom || '').toString().substring(0, 10);
  new bootstrap.Modal(document.getElementById('empShiftModal')).show();
}

async function saveEmpShift() {
  const body = {
    EmployeeId:    parseInt(document.getElementById('esEmployee').value)      || null,
    ShiftId:       parseInt(document.getElementById('esShift').value)         || null,
    EffectiveFrom: document.getElementById('esEffectiveFrom').value,
  };
  if (!body.EmployeeId || !body.ShiftId || !body.EffectiveFrom) {
    showToast('Employee, Shift and Effective Date are required', 'error'); return;
  }

  const result = editingEmpShiftId
    ? await EmployeeShifts.update(editingEmpShiftId, body)
    : await EmployeeShifts.create(body);

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('empShiftModal'))?.hide();
    showToast(editingEmpShiftId ? 'Shift assignment updated!' : 'Shift assigned!');
    await loadEmpShifts();
  }
}

async function deleteEmpShift(id) {
  if (!confirmDelete('Remove this shift assignment?')) return;
  const r = await EmployeeShifts.delete(id);
  if (r) { showToast('Shift assignment removed'); await loadEmpShifts(); }
}