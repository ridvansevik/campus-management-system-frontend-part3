import api from './api';

export const getEvents = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.date) params.append('date', filters.date);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  return api.get(`/events?${params.toString()}`);
};

export const getEventDetail = (id) => api.get(`/events/${id}`);
export const registerEvent = (eventId, customFields = {}) => api.post(`/events/${eventId}/register`, { customFields });
export const getMyEvents = () => api.get('/events/my-events');
export const cancelEventRegistration = (id) => api.delete(`/events/registrations/${id}`);
// Admin/Personel
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const getEventRegistrations = (eventId) => api.get(`/events/${eventId}/registrations`);
export const checkInEvent = (eventId, registrationId, qrCode) => {
  // Backend route:
  // - POST /events/checkin (QR kod ile check-in)
  // - POST /events/:eventId/registrations/:registrationId/checkin (ID ile check-in)
  if (!eventId || !registrationId) {
    // QR kod ile check-in için özel route
    return api.post('/events/checkin', { qrCode });
  }
  // ID ile check-in
  return api.post(`/events/${eventId}/registrations/${registrationId}/checkin`, { qrCode });
};