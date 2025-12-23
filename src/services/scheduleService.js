import api from './api';

export const getMySchedule = () => api.get('/scheduling/my-schedule');
export const getScheduleDetail = (scheduleId) => api.get(`/scheduling/${scheduleId}`);
export const downloadIcal = () => api.get('/scheduling/my-schedule/ical', { responseType: 'blob' });
// Admin
export const generateSchedule = (data) => api.post('/scheduling/generate', data); // { semester, year, clearExisting }
export const getAllDepartmentSchedules = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.semester) queryParams.append('semester', params.semester);
  if (params.year) queryParams.append('year', params.year);
  return api.get(`/scheduling/departments/all?${queryParams.toString()}`);
};
export const getSchedulesByDepartment = (departmentId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.semester) queryParams.append('semester', params.semester);
  if (params.year) queryParams.append('year', params.year);
  return api.get(`/scheduling/departments/${departmentId}?${queryParams.toString()}`);
};
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
// YENİ: Raporlama Endpoint'i
export const getResourceUtilization = () => {
  return api.get('/schedule/reports/utilization');
};