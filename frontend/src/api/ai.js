import api from './client';

export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
};
