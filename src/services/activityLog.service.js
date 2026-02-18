import api from './api';

// Get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const ALLOWED_PAGE_ACTIONS = {
  'Home Page': 'Home Page Updated',
  'About Page': 'Updated About Page Content',
  'History Page': 'Updated History Page Content',
  'Events Page': 'Updated Events Page',
  'Gallery Page': 'Updated Gallery',
  'Results Page': 'Updated Match Results'
};

// Log admin activity
const logActivity = async (action, pageName, details = '') => {
  try {
    const user = getUser();
    if (!user) {
      console.warn('No user found in localStorage, cannot log activity');
      return null;
    }

    if (user.role !== 'admin') {
      return null;
    }

    if (ALLOWED_PAGE_ACTIONS[pageName] !== action) {
      return null;
    }

    const payload = {
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

// Get activity logs for a specific page
const getPageActivityLogs = async (pageName, limit = 20) => {
  try {
    const response = await api.get(`/admin-activity/page/${encodeURIComponent(pageName)}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching page activity logs:', error);
    throw error;
  }
};

export const activityLogService = {
  logActivity,
  getMyActivityLogs,
  getAllActivityLogs,
  getPageActivityLogs
};

export default activityLogService;
