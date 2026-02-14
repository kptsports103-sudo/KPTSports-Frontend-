import api from './api';

// Get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Log admin activity
const logActivity = async (action, pageName, details = '') => {
  try {
    const user = getUser();
    if (!user) {
      console.warn('No user found in localStorage, cannot log activity');
      return null;
    }

    const payload = {
      adminId: user._id || user.id,
      adminName: user.name || user.email || 'Unknown',
      role: user.role || 'admin',
      action,
      pageName,
      details
    };

    const response = await api.post('/admin-activity', payload);
    return response.data;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - activity logging should not break main functionality
    return null;
  }
};

// Get current user's activity logs
const getMyActivityLogs = async (limit = 15, page = 1) => {
  try {
    const response = await api.get(`/admin-activity/my-logs?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my activity logs:', error);
    throw error;
  }
};

// Get all activity logs (Super Admin only)
const getAllActivityLogs = async (limit = 50, page = 1, filters = {}) => {
  try {
    let queryParams = `?limit=${limit}&page=${page}`;
    
    if (filters.from && filters.to) {
      queryParams += `&from=${filters.from}&to=${filters.to}`;
    }
    
    if (filters.search) {
      queryParams += `&search=${filters.search}`;
    }

    const response = await api.get(`/admin-activity/all${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all activity logs:', error);
    throw error;
  }
};

export const activityLogService = {
  logActivity,
  getMyActivityLogs,
  getAllActivityLogs
};

export default activityLogService;
