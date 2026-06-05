import api from './api';

export const alertsService = {
  getAll: () => api.get('/alerts').then((r) => r.data),
  markAsRead: (id) => api.patch(`/alerts/${id}/read`).then((r) => r.data),
};
