import { apiClient } from './apiClient';

export const notificationsService = {
  getNotifications: () => apiClient.get('/api/notifications/'),
  markRead: (id)    => apiClient.patch(`/api/notifications/${id}/read/`),
  markAllRead: ()   => apiClient.patch('/api/notifications/read-all/'),
};
