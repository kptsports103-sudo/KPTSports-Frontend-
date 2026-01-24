import axios from 'axios';

const api = axios.create({

  baseURL: 'https://kpt-sports-backend.vercel.app/api/v1',

});

api.interceptors.request.use(config => {

  const token = localStorage.getItem('accessToken');

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  return config;

});

api.interceptors.response.use(

  response => response,

  error => {

    if (error.response && error.response.status === 401) {

      localStorage.removeItem('accessToken');

      localStorage.removeItem('user');

      window.location.href = '/login';

    }

    return Promise.reject(error);

  }

);

export default api;