import api from './api';

export const claimsService = {
  chat: (history, message) =>
    api.post('/claims/chat', { history, message }).then((r) => r.data),
};
