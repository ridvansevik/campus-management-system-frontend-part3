import api from './api';

/**
 * Audit Log Service
 * Admin için işlem logları
 */

// Log listesi
export const getAuditLogs = async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });
    const response = await api.get(`/audit-logs?${queryParams.toString()}`);
    return response.data;
};

// Log detayı
export const getAuditLogDetail = async (id) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
};

// Kullanıcı logları
export const getUserAuditLogs = async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/audit-logs/user/${userId}?${queryParams}`);
    return response.data;
};

// Log istatistikleri
export const getAuditStats = async () => {
    const response = await api.get('/audit-logs/stats');
    return response.data;
};

export default {
    getAuditLogs,
    getAuditLogDetail,
    getUserAuditLogs,
    getAuditStats
};
