import { logout } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Handle 401 unauthorized / expired tokens across all client-side calls
const handle401 = () => {
  if (typeof window === 'undefined') return;
  logout();
  const path = window.location.pathname;
  if (path.startsWith('/admin') && path !== '/admin/login') {
    window.location.href = '/admin/login';
  } else if (path.startsWith('/dashboard') && path !== '/dashboard/login') {
    window.location.href = '/dashboard/login';
  }
};

// Build headers — optionally attach JWT from localStorage
const buildHeaders = (withAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic fetch wrapper — returns { data, ok, status }
const apiFetch = async (path, options = {}, withAuth = false) => {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: buildHeaders(withAuth),
    });

    if (withAuth && res.status === 401) {
      handle401();
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { data, ok: res.ok, status: res.status };
  } catch (err) {
    return {
      data: { message: 'Network error or server unreachable. Please check your connection.' },
      ok: false,
      status: 0,
    };
  }
};

// ── Public (no auth) ─────────────────────────────────

export const post = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) });

export const get = (path) =>
  apiFetch(path, { method: 'GET' });

// ── Authenticated (attaches JWT) ─────────────────────

export const authPost = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) }, true);

export const authGet = (path) =>
  apiFetch(path, { method: 'GET' }, true);

export const authPut = (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }, true);

export const authDelete = (path) =>
  apiFetch(path, { method: 'DELETE' }, true);

// ── File upload (multipart/form-data) ────────────────
// Cannot use apiFetch/buildHeaders here — Content-Type must NOT be set
// manually; the browser inserts it with the correct multipart boundary.

export const authUploadFile = async (path, formData) => {
  try {
    const headers = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401) {
      handle401();
    }

    let data = null;
    try { data = await res.json(); } catch { data = null; }
    return { data, ok: res.ok, status: res.status };
  } catch (err) {
    return {
      data: { message: 'Network error or upload server unreachable.' },
      ok: false,
      status: 0,
    };
  }
};
