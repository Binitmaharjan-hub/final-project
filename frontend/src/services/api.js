const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }
  return response.status === 204 ? null : response.json();
};

export const api = {
  list: (search = '') => request(`/api/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (student) => request('/api/students', { method: 'POST', body: JSON.stringify(student) }),
  update: (id, student) => request(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  remove: (id) => request(`/api/students/${id}`, { method: 'DELETE' })
};
