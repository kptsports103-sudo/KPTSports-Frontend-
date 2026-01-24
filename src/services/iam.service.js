import api from './api';

export const IAMService = {
  getUsers: async ({ page = 1, limit = 10, sort = 'name', dir = 'asc' } = {}) => {
    const response = await api.get('/v1/iam/users', {
      params: { page, limit, sort, dir }
    });
    return response.data;
  },

  createUser: async (payload) => {
    const response = await api.post('/v1/iam/users', payload);
    return response.data;
  },

  verifyOTP: async (userId, otp) => {
    const response = await api.post('/v1/iam/verify-otp', { userId, otp });
    return response.data;
  },

  verifyPhoneOTP: async (userId, otp) => {
    const response = await api.post('/v1/iam/verify-phone-otp', { userId, otp });
    return response.data;
  },

  resendOTP: async (userId) => {
    const response = await api.post('/v1/iam/resend-otp', { userId });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/v1/iam/users/${userId}`);
    return response.data;
  }
};