const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(withAuth),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { data, ok: res.ok, status: res.status };
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
