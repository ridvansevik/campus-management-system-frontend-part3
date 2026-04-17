import api from './api';

/**
 * Analytics Service
 * Admin dashboard için istatistik verileri
 */

// Genel istatistikler
export const getOverview = async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
};

// Kayıt trendi
export const getRegistrationTrend = async (days = 30) => {
    const response = await api.get(`/analytics/registration-trend?days=${days}`);
    return response.data;
};

// Yoklama istatistikleri
export const getAttendanceStats = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/analytics/attendance?${queryParams}`);
    return response.data;
};

// Yemek istatistikleri
export const getMealStats = async () => {
    const response = await api.get('/analytics/meals');
    return response.data;
};

// Etkinlik istatistikleri
export const getEventStats = async () => {
    const response = await api.get('/analytics/events');
    return response.data;
};

// Akademik istatistikler
export const getAcademicStats = async () => {
    const response = await api.get('/analytics/academic');
    return response.data;
};

// Finansal istatistikler
export const getFinancialStats = async () => {
    const response = await api.get('/analytics/financial');
    return response.data;
};

// Derslik kullanım oranları
export const getClassroomUtilization = async () => {
    const response = await api.get('/analytics/classroom-utilization');
    return response.data;
};

// Sistem sağlık durumu
export const getSystemHealth = async () => {
    const response = await api.get('/analytics/system-health');
    return response.data;
};

export default {
    getOverview,
    getRegistrationTrend,
    getAttendanceStats,
    getMealStats,
    getEventStats,
    getAcademicStats,
    getFinancialStats,
    getClassroomUtilization,
    getSystemHealth
};
