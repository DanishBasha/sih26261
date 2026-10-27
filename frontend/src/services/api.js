const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }
  return data;
}
