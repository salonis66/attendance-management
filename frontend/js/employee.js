/* =============================================
   employee.js - Employee CRUD Module
   ============================================= */

let allEmployees = [];
let editingEmployeeId = null;

async function loadEmployees() {
  const data = await Employees.getAll();
  allEmployees = data?.employees || data?.data || data || [];
  renderEmployeeTable(allEmployees);
}

function renderEmployeeTable(employees) {
  const tbody = document.getElementById('employeeTbody');
  if (!tbody) return;

  if (!employees.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><i class="bi bi-people"></i><p>No employees found</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:12px;background:#f3f4f6;padding:3px 8px;border-radius:6px;">${esc(emp.EmployeeCode || emp.employeeCode)}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#06b6d4);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;flex-shrink:0;">
            ${(emp.Name || emp.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style="font-weight:600;">${esc(emp.Name || emp.name)}</div>
            <div style="font-size:11.5px;color:#6b7280;">${esc(emp.Email || emp.email)}</div>
          </div>
        </div>
      </td>
      <td>${esc(emp.Phone || emp.phone)}</td>
      <td>${esc(emp.DepartmentName || emp.department?.name || emp.DepartmentId)}</td>
      <td>${esc(emp.DesignationName || emp.designation?.name || emp.DesignationId)}</td>
      <td>${fmtDate(emp.DateOfJoining || emp.dateOfJoining)}</td>
      <td>${(emp.IsActive ?? emp.isActive) ? '<span class="badge-custom badge-success">Active</span>' : '<span class="badge-custom badge-danger">Inactive</span>'}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-sm-icon btn-edit" title="Edit" onclick="openEditEmployee('${emp._id || emp.id}')"><i class="bi bi-pencil"></i></button>
          <button class="btn-sm-icon btn-delete" title="Delete" onclick="deleteEmployee('${emp._id || emp.id}')"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function searchEmployees(query) {
  const q = query.toLowerCase();
  const filtered = allEmployees.filter(emp =>
    (emp.Name || emp.name || '').toLowerCase().includes(q) ||
    (emp.Email || emp.email || '').toLowerCase().includes(q) ||
    (emp.EmployeeCode || emp.employeeCode || '').toLowerCase().includes(q)
  );
  renderEmployeeTable(filtered);
}

async function openAddEmployee() {
  editingEmployeeId = null;
  document.getElementById('employeeModalTitle').textContent = 'Add Employee';
  document.getElementById('employeeForm').reset();
  await populateEmployeeDropdowns();
  new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

async function openEditEmployee(id) {
  editingEmployeeId = id;
  const emp = allEmployees.find(e => (e._id || e.id) == id);
  if (!emp) return;

  document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
  await populateEmployeeDropdowns();

  document.getElementById('empCode').value = emp.EmployeeCode || emp.employeeCode || '';
  document.getElementById('empName').value = emp.Name || emp.name || '';
  document.getElementById('empEmail').value = emp.Email || emp.email || '';
  document.getElementById('empPhone').value = emp.Phone || emp.phone || '';
  document.getElementById('empDepartment').value = emp.DepartmentId || emp.departmentId || '';
  document.getElementById('empDesignation').value = emp.DesignationId || emp.designationId || '';
  document.getElementById('empDOJ').value = (emp.DateOfJoining || emp.dateOfJoining || '').substring(0, 10);
  document.getElementById('empIsActive').value = String(emp.IsActive ?? emp.isActive ?? true);

  new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

async function populateEmployeeDropdowns() {
  const [deptData, desigData] = await Promise.all([Departments.getAll(), Designations.getAll()]);
  const depts = deptData?.departments || deptData?.data || deptData || [];
  const desigs = desigData?.designations || desigData?.data || desigData || [];

  const deptSel = document.getElementById('empDepartment');
  const desigSel = document.getElementById('empDesignation');

  deptSel.innerHTML = '<option value="">Select Department</option>' +
    depts.map(d => `<option value="${d._id || d.id}">${esc(d.Name || d.name)}</option>`).join('');

  desigSel.innerHTML = '<option value="">Select Designation</option>' +
    desigs.map(d => `<option value="${d._id || d.id}">${esc(d.Name || d.name)}</option>`).join('');
}

async function saveEmployee() {
  const body = {
    EmployeeCode: document.getElementById('empCode').value.trim(),
    Name: document.getElementById('empName').value.trim(),
    Email: document.getElementById('empEmail').value.trim(),
    Phone: document.getElementById('empPhone').value.trim(),
    DepartmentId: document.getElementById('empDepartment').value,
    DesignationId: document.getElementById('empDesignation').value,
    DateOfJoining: document.getElementById('empDOJ').value,
    IsActive: document.getElementById('empIsActive').value === 'true',
  };

  if (!body.Name || !body.Email) {
    showToast('Name and Email are required', 'error'); return;
  }

  let result;
  if (editingEmployeeId) {
    result = await Employees.update(editingEmployeeId, body);
  } else {
    result = await Employees.create(body);
  }

  if (result) {
    bootstrap.Modal.getInstance(document.getElementById('employeeModal'))?.hide();
    showToast(editingEmployeeId ? 'Employee updated!' : 'Employee added!');
    await loadEmployees();
  }
}

async function deleteEmployee(id) {
  if (!confirmDelete('Delete this employee? This action cannot be undone.')) return;
  const result = await Employees.delete(id);
  if (result) {
    showToast('Employee deleted');
    await loadEmployees();
  }
}