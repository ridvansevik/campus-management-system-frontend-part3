import api from './api';

export const getMenus = (date) => api.get(`/meals/menus?date=${date || ''}`);
export const getMenuDetail = (id) => api.get(`/meals/menus/${id}`);
export const createReservation = (data) => api.post('/meals/reservations', data); // { menuId }
export const getMyReservations = () => api.get('/meals/reservations/my-reservations');
export const cancelReservation = (id) => api.delete(`/meals/reservations/${id}`);
export const useReservation = (id, qrCode) => {
  // Backend route: 
  // - POST /meals/reservations/use (QR kod ile kullanım)
  // - POST /meals/reservations/:id/use (ID ile kullanım)
  if (id === 'use' && qrCode) {
    // QR kod ile kullanım için özel route
    return api.post('/meals/reservations/use', { qrCode });
  }
  // ID ile kullanım
  return api.post(`/meals/reservations/${id}/use`, { qrCode });
};
// Admin işlemleri
export const createMenu = (data) => api.post('/meals/menus', data);
export const updateMenu = (id, data) => api.put(`/meals/menus/${id}`, data);
export const deleteMenu = (id) => api.delete(`/meals/menus/${id}`);