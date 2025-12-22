import api from './api';

export const getMySchedule = () => api.get('/scheduling/my-schedule');
export const getScheduleDetail = (scheduleId) => api.get(`/scheduling/${scheduleId}`);
export const downloadIcal = () => api.get('/scheduling/my-schedule/ical', { responseType: 'blob' });
// Admin
export const generateSchedule = (data) => api.post('/scheduling/generate', data); // { semester, year, clearExisting }
// Classroom Reservations
export const createClassroomReservation = (data) => api.post('/reservations', data);
export const getClassroomReservations = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.date) params.append('date', filters.date);
  if (filters.classroomId) params.append('classroomId', filters.classroomId);
  return api.get(`/reservations?${params.toString()}`);
};
export const approveReservation = (id) => api.put(`/reservations/${id}/approve`);
export const rejectReservation = (id) => api.put(`/reservations/${id}/reject`);