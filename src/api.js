import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

// TODO: rapihin
export const getUsers = () => api.get('/api/users');
export const getCurrentUser = () => api.get('/api/me');
export const getClasses = () => api.get('/api/classes');
export const getEnrollments = () => api.get('/api/enrollments');
export const getOffers = () => api.get('/api/offers');
export const createOffer = (data) => api.post('/api/offers', data);
export const deleteOffer = (offerId) => api.delete(`/api/offers/${offerId}`);
export const takeOffer = (offerId, takerNim) => api.post(`/api/offers/${offerId}/take`, { takerNim });
export const getNotifications = () => api.get('/api/notifications');
export const markAllNotificationsRead = () => api.patch('/api/notifications/read-all');
export const getSocketToken = () => api.get('/api/socket-token');
export const getAdminStats = () => api.get('/api/admin/stats');
export const uploadScheduleCsv = (formData) => api.post('/api/admin/upload-schedule', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const purgeAllOffers = () => api.delete('/api/admin/purge-offers');
export const exportRecapSchedules = () => api.get('/api/admin/export-recap', { responseType: 'blob' });

export default api;