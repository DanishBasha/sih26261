const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  let authHeaders = {};
  try {
    const stored = localStorage.getItem('sih_user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u.id) authHeaders['x-user-id'] = u.id;
      if (u.email) authHeaders['x-user-email'] = u.email;
      if (u.raw_role || u.role) authHeaders['x-user-role'] = u.raw_role || u.role;
    }
  } catch (e) {
    // ignore
  }

  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? { ...authHeaders, ...(options.headers || {}) } : headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }
  return data;
}
