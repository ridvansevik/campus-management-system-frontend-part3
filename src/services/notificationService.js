import api from './api';

/**
 * Notification Service
 * Bildirim API işlemleri
 */

// Bildirimleri listele
export const getNotifications = async (params = {}) => {
    const { page = 1, limit = 20, category, is_read } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (category) queryParams.append('category', category);
    if (is_read !== undefined) queryParams.append('is_read', is_read);

    const response = await api.get(`/notifications?${queryParams.toString()}`);
    return response.data;
};

// Okunmamış bildirim sayısını getir
export const getUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

// Bildirimi okundu olarak işaretle
export const markAsRead = async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllAsRead = async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
};

// Bildirimi sil
export const deleteNotification = async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

// Tüm bildirimleri sil
export const clearAllNotifications = async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
};

// Bildirim tercihlerini getir
export const getPreferences = async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
};

// Bildirim tercihlerini güncelle
export const updatePreferences = async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getPreferences,
    updatePreferences
};
