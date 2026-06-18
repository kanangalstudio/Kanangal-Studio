import axios from 'axios';
import { auth } from './Firebase';

const isLocal = window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.startsWith('192.168.');

const baseURL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

console.log("🛠️ Using API Base URL:", baseURL);

const api = axios.create({ baseURL });

// Interceptor to attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const studioAPI = {
  login: () => api.post('/api/auth/studio/login'),
  getDashboard: () => api.get('/api/studios/dashboard'),
  getFamilies: () => api.get('/api/studios/families'),
  getEvents: () => api.get('/api/studios/events'),
  createFamily: (form) => api.post('/api/studios/families', {
    family_name: form.name,
    description: form.address, // Mapping address to description for now as notes
    // Backend also takes these if columns exist:
    primary_contact_name: form.primary_contact_name,
    primary_contact_email: form.primary_contact_email,
    phone: form.phone,
    address: form.address
  }),
  getFamilyDetail: (id) => api.get(`/api/studios/families/${id}`),
  updateFamily: (id, form) => api.put(`/api/studios/families/${id}`, {
    family_name: form.name,
    primary_contact_name: form.primary_contact_name,
    primary_contact_email: form.primary_contact_email,
    phone: form.phone,
    address: form.address
  }),
  deleteFamily: (id) => api.delete(`/api/studios/families/${id}`),
  getFamilyEvents: (id) => api.get(`/api/studios/families/${id}/events`),
  getFamilyAlbums: (id) => api.get(`/api/studios/families/${id}/albums`),
  createEvent: (familyId, data) => api.post(`/api/studios/families/${familyId}/events`, data),
  getEventDetail: (id) => api.get(`/api/studios/events/${id}`),
  getEventAlbums: (id) => api.get(`/api/studios/events/${id}/albums`),
  createAlbum: (eventId, form) => api.post(`/api/studios/events/${eventId}/albums`, {
    title: form.name,
    description: form.description
  }),
  getAlbumPages: (id) => api.get(`/api/studios/albums/${id}/pages`),
  uploadPage: (formData, onProgress) => api.post('/api/upload/page', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) onProgress(percent);
    }
  }),
  deletePage: (pageId) => api.delete(`/api/upload/page/${pageId}`),
  bulkDeletePages: (pageIds) => api.post('/api/upload/bulk-delete', { pageIds }),
  bulkUpdatePages: (updates) => api.post('/api/upload/bulk-update', { updates }),
  publishEvent: (eventId, published) => api.patch(`/api/studios/events/${eventId}/publish`, { published }),
  updateProfile: (data) => api.put('/api/studios/profile', data),
  addMember: (familyId, data) => api.post(`/api/studios/families/${familyId}/members`, data),
  updateMember: (familyId, memberId, data) => api.put(`/api/studios/families/${familyId}/members/${memberId}`, data),
  removeMember: (familyId, memberId) => api.delete(`/api/studios/families/${familyId}/members/${memberId}`),
  
  // Crew API Endpoints
  getCrew: () => api.get('/api/studios/crew'),
  createCrew: (data) => api.post('/api/studios/crew', data),
  updateCrew: (id, data) => api.put(`/api/studios/crew/${id}`, data),
  deleteCrew: (id) => api.delete(`/api/studios/crew/${id}`),
  getEventCrew: (eventId) => api.get(`/api/studios/events/${eventId}/crew`),
  assignCrew: (eventId, data) => api.post(`/api/studios/events/${eventId}/crew`, data),
  removeCrew: (eventId, assignmentId) => api.delete(`/api/studios/events/${eventId}/crew/${assignmentId}`),
  
  // Reusable Packages API Endpoints
  getPackages: () => api.get('/api/studios/packages'),
  createPackage: (data) => api.post('/api/studios/packages', data),
  updatePackage: (id, data) => api.put(`/api/studios/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/api/studios/packages/${id}`),
  
  // Billing and Expense Tracking API Endpoints
  getEventBilling: (eventId) => api.get(`/api/studios/events/${eventId}/billing`),
  updateEventBilling: (eventId, data) => api.put(`/api/studios/events/${eventId}/billing`, data)
};

export default api;
