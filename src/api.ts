import axios from 'axios';
import type { User, ParallelClass, Enrollment, Offer, Notification } from './types';

// --- Konfigurasi API -----------------------------------------

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Jangan intercept jika itu request /api/me pas loading awal
      if (error.config && error.config.url && error.config.url.includes('/api/me')) {
        return Promise.reject(error);
      }
      
      // Bersihkan sesi lokal
      localStorage.clear();
      sessionStorage.clear();
      
      // Notify backend logout
      try {
        await fetch('/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      } catch {}

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- API Mahasiswa --------------------------------------------

export const getUsers = () => api.get<User[]>('/api/users');
export const getCurrentUser = () => api.get<User>('/api/me');
export const getClasses = () => api.get<ParallelClass[]>('/api/classes');
export const getEnrollments = () => api.get<Enrollment[]>('/api/enrollments');
export const getOffers = () => api.get<Offer[]>('/api/offers');
export const createOffer = (data: { myClassId: number; wantedClassId: number }) => 
  api.post<Offer>('/api/offers', data);
export const createPickDropOffer = (data: { myClassId: number; reservedForNim?: string }) =>
  api.post<Offer>('/api/offers/pick-drop', data);
export const deleteOffer = (offerId: number) => 
  api.delete(`/api/offers/${offerId}`);
export const takeOffer = (offerId: number, takerNim: string) => 
  api.post<{ success: boolean }>(`/api/offers/${offerId}/take`, { takerNim });
export const claimPickDropOffer = (offerId: number, claimerNim: string) =>
  api.post<{ success: boolean }>(`/api/offers/${offerId}/claim`, { claimerNim });
export const getNotifications = () => 
  api.get<Notification[]>('/api/notifications');
export const markAllNotificationsRead = () => 
  api.patch('/api/notifications/read-all');
export const getSocketToken = () => 
  api.get<{ token: string }>('/api/socket-token');
export const getBarterStatus = () =>
  api.get<{ enabled: boolean }>('/api/barter-status');

// --- API Admin ------------------------------------------------

// Dashboard & Master Data
export const getAdminStats = () => 
  api.get<{
    totalStudents: number;
    totalClasses: number;
    totalEnrollments: number;
    totalOffers: number;
  }>('/api/admin/stats');
export const uploadScheduleCsv = (formData: FormData) => 
  api.post<{ message: string }>('/api/admin/upload-schedule', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const purgeAllOffers = () => 
  api.delete('/api/admin/purge-offers');
export const exportRecapSchedules = () => 
  api.get<Blob>('/api/admin/export-recap', { responseType: 'blob' });

// Manajemen Mahasiswa (Search, Detail, CRUD)
export const getAdminUsers = (query = '') => 
  api.get<User[]>(`/api/admin/users?search=${query}`);
export const getAdminUserDetail = (nim: string) => 
  api.get<{ user: User; enrollments: Enrollment[] }>(`/api/admin/users/${nim}`);
export const addAdminUser = (userData: Partial<User>) => 
  api.post<User>('/api/admin/users', userData);
export const updateAdminUser = (oldNim: string, updateData: Partial<User>) => 
  api.put<User>(`/api/admin/users/${oldNim}`, updateData);
export const deleteAdminUser = (nim: string) => 
  api.delete(`/api/admin/users/${nim}`);

// Manajemen KRS (Drop & Add Course)
export const addAdminEnrollment = (data: { nim: string; parallelClassId: number }) => 
  api.post<Enrollment>('/api/admin/enrollments', data);
export const deleteAdminEnrollment = (enrollmentId: number) => 
  api.delete(`/api/admin/enrollments/${enrollmentId}`);
export const updateAdminEnrollment = (enrollmentId: number, data: { parallelClassId: number }) => 
  api.put<Enrollment>(`/api/admin/enrollments/${enrollmentId}`, data);

// Manajemen Barter & Override
export const deleteAdminOffer = (offerId: number) => 
  api.delete(`/api/admin/offers/${offerId}`);
export const getTemplateDownloadUrl = (type: string) => {
  const base = api.defaults.baseURL || '';
  if (base === '/') {
    return `/api/admin/template/${type}`;
  }
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base.replace(/\/$/, '')}/api/admin/template/${type}`;
  }
  return `/api/admin/template/${type}`;
};

export const overrideSwap = (swapData: {
  nim1: string;
  classId1: number;
  nim2: string;
  classId2: number;
}) => api.post<{ success: boolean }>('/api/admin/override-swap', swapData);

export const getAdminBarterStatus = () =>
  api.get<{ enabled: boolean }>('/api/admin/barter-status');
export const toggleBarterStatus = (enabled: boolean) =>
  api.post<{ message: string; enabled: boolean }>('/api/admin/barter-toggle', { enabled });

export default api;
