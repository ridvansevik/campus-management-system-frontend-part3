import api from './api';

export const getMySchedule = () => api.get('/scheduling/my-schedule');
export const getScheduleDetail = (scheduleId) => api.get(`/scheduling/${scheduleId}`);
export const downloadIcal = () => api.get('/scheduling/my-schedule/ical', { responseType: 'blob' });
// Admin
export const generateSchedule = (data) => api.post('/scheduling/generate', data); // { semester, year, clearExisting }

// Draft Schedule Management (Admin)
export const getDraftSchedules = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.semester) queryParams.append('semester', params.semester);
  if (params.year) queryParams.append('year', params.year);
  const queryString = queryParams.toString();
  return api.get(`/scheduling/drafts${queryString ? `?${queryString}` : ''}`);
};

export const approveDraftSchedule = (batchId, options = {}) => {
  return api.post(`/scheduling/approve/${batchId}`, options);
};

export const rejectDraftSchedule = (batchId) => {
  return api.delete(`/scheduling/reject/${batchId}`);
};

export const getActiveSchedules = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.semester) queryParams.append('semester', params.semester);
  if (params.year) queryParams.append('year', params.year);
  if (params.departmentId) queryParams.append('departmentId', params.departmentId);
  const queryString = queryParams.toString();
  return api.get(`/scheduling/active${queryString ? `?${queryString}` : ''}`);
};

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
  return api.get('/scheduling/reports/utilization');
};