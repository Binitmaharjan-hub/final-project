const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const nonJsonResponseMessage = 'The API returned HTML instead of JSON. Check that VITE_API_URL points to your backend API and that /api requests are routed to it.';

const readJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json') && !contentType.includes('+json')) {
    throw new Error(nonJsonResponseMessage);
  }
  return response.json();
};

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!response.ok) {
    const body = await readJson(response);
    throw new Error(body.message || 'Request failed');
  }
  return response.status === 204 ? null : readJson(response);
};

export const api = {
  list: (search = '') => request(`/api/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (student) => request('/api/students', { method: 'POST', body: JSON.stringify(student) }),
  update: (id, student) => request(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  remove: (id) => request(`/api/students/${id}`, { method: 'DELETE' })
};
