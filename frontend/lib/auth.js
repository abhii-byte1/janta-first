const TOKEN_KEY = 'token';

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// Decode JWT payload without a library (base64 decode the middle segment)
export const getTokenPayload = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const payload = getTokenPayload();
  return payload ? payload.role : null;
};

export const isAdmin = () => getUserRole() === 'admin';
