import api from './api';

export const contractsService = {
  getAll: () => api.get('/contracts').then((r) => r.data),
  getById: (id) => api.get(`/contracts/${id}`).then((r) => r.data),
  create: (data) => api.post('/contracts', data).then((r) => r.data),
  uploadPdf: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/contracts/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  delete: (id) => api.delete(`/contracts/${id}`).then((r) => r.data),
};
