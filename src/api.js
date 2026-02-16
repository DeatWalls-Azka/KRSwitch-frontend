import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

export const getUsers = () => api.get('/api/users');
export const getCurrentUser = () => api.get('/api/me');
export const getClasses = () => api.get('/api/classes');
export const getEnrollments = () => api.get('/api/enrollments');
export const getOffers = () => api.get('/api/offers');
export const createOffer = (data) => api.post('/api/offers', data);
export const deleteOffer = (offerId) => api.delete(`/api/offers/${offerId}`);
export const takeOffer = (offerId, takerNim) => api.post(`/api/offers/${offerId}/take`, { takerNim });

export default api;