import axios from 'axios';
import { clearAuthStorage, getAccessToken } from '../context/tokenStorage';

const api = axios.create({

  baseURL: 'https://kpt-sports-backend.vercel.app/api/v1',

});

api.interceptors.request.use(config => {

  const token = getAccessToken();

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  if (typeof window !== 'undefined') {
    config.headers['X-Client-Path'] = window.location.pathname || '/';
  }

  return config;

});

api.interceptors.response.use(

  response => response,

  error => {

    if (error.response && error.response.status === 401) {

      clearAuthStorage();

      window.location.href = '/login';

    }

    return Promise.reject(error);

  }

);

export default api;
