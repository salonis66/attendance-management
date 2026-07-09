/* =============================================
   auth.js - Authentication Utilities
   JWT payload contains: { tenantId, email, iat, exp }
   ============================================= */

const TOKEN_KEY = 'hrms_token';
const USER_KEY  = 'hrms_user';

/* ── Token helpers ── */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch { return null; }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Decode JWT payload without verifying signature.
 * Login response only returns token — we extract tenantId from payload.
 */
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded; // { tenantId, email, iat, exp }
  } catch {
    return null;
  }
}

/**
 * Get the current tenant's ID (used for company profile, etc.)
 * Stored in user object after login.
 */
function getTenantId() {
  const user = getUser();
  return user?.tenantId || user?.TenantId || null;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html';
}

/** Call on every protected page — redirects to login if no token */
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/** Call on login page — redirects to dashboard if already logged in */
function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = 'dashboard.html';
  }
}

/* ── UI Helpers (available globally) ── */

let loadingCount = 0;

function showLoading() {
  loadingCount++;
  const el = document.getElementById('loadingOverlay');
  if (el) el.classList.add('show');
}

function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.remove('show');
  }
}

let toastTimer;
function showToast(message, type = 'success') {
  const el = document.getElementById('alertToast');
  if (!el) return;
  const icons = {
    success: 'check-circle-fill',
    error:   'x-circle-fill',
    warning: 'exclamation-triangle-fill',
  };
  el.className = `alert-toast ${type} show`;
  el.innerHTML = `<i class="bi bi-${icons[type] || 'info-circle-fill'}"></i> ${message}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

/** Populate sidebar user info from stored user object */
function populateSidebarUser() {
  const user = getUser();
  if (!user) return;
  const nameEl   = document.getElementById('sidebarUserName');
  const roleEl   = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarUserAvatar');
  const name = user.name || user.Name || user.email || user.Email || 'Admin';
  if (nameEl)   nameEl.textContent   = name;
  if (roleEl)   roleEl.textContent   = 'Company Admin';
  if (avatarEl) avatarEl.textContent = name[0].toUpperCase();
}

/** Escape HTML to prevent XSS in table cells */
function esc(str) {
  if (str == null) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format ISO date strings → "15 Jan 2024" */
function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return d; }
}

/** Confirm delete helper */
function confirmDelete(message = 'Delete this record? This cannot be undone.') {
  return window.confirm(message);
}