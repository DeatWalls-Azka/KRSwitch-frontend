import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

export const getUsers = () => api.get('/api/users');
export const getCurrentUser = () => api.get('/api/me');
export const getClasses = () => api.get('/api/classes');
export const getEnrollments = () => api.get('/api/enrollments');
export const getOffers = () => api.get('/api/offers');

export default api;