import api from './api';

// ── Auth Service ────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  linkCaregiver: (inviteCode) => api.post('/auth/link', { inviteCode }),
  getLinkedUsers: () => api.get('/auth/linked'),
};

// ── Memory Service ──────────────────────────────────────────
export const memoryService = {
  create: (formData) =>
    api.post('/memories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (patientId, params = {}) =>
    api.get(`/memories/${patientId}`, { params }),
  getOne: (id) => api.get(`/memories/detail/${id}`),
  update: (id, data) => api.put(`/memories/${id}`, data),
  delete: (id) => api.delete(`/memories/${id}`),
};

// ── Routine Service ─────────────────────────────────────────
export const routineService = {
  create: (formData) =>
    api.post('/routines', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (patientId, params = {}) =>
    api.get(`/routines/${patientId}`, { params }),
  update: (id, data) => api.put(`/routines/${id}`, data),
  complete: (id) => api.patch(`/routines/${id}/complete`),
  delete: (id) => api.delete(`/routines/${id}`),
};

// ── Daily Log Service ───────────────────────────────────────
export const logService = {
  create: (data) => api.post('/logs', data),
  getAll: (patientId, params = {}) =>
    api.get(`/logs/${patientId}`, { params }),
  getTrends: (patientId) => api.get(`/logs/${patientId}/trends`),
};

// ── Message Service ─────────────────────────────────────────
export const messageService = {
  send: (data) => api.post('/messages', data),
  getAll: (patientId, params = {}) =>
    api.get(`/messages/${patientId}`, { params }),
};

// ── AI Companion Service ────────────────────────────────────
export const companionService = {
  chat: (data) => api.post('/companion/chat', data),
  getHistory: (patientId) => api.get(`/companion/history/${patientId}`),
  clearHistory: (patientId) => api.delete(`/companion/history/${patientId}`),
  updateProfile: (patientId, data) =>
    api.put(`/companion/profile/${patientId}`, data),
  getProfile: (patientId) => api.get(`/companion/profile/${patientId}`),
};

// ── File Service ────────────────────────────────────────────
export const fileService = {
  getFileUrl: (fileId) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}/api/files/${fileId}`;
  },
};
