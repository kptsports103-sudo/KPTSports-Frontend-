import axios from 'axios';
import { getAccessToken, setAccessToken } from '../context/tokenStorage';

// create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kpt-sports-backend.vercel.app/api',
  withCredentials: true // allow cookies (refresh token)
});

// request interceptor attaches access token if present
api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// response interceptor to attempt refresh on 401
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  r => r,
  async (err) => {
    const originalReq = err.config;
    if (err.response && err.response.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = api.post('/auth/refresh').then(res => {
          const { accessToken } = res.data;
          setAccessToken(accessToken);
          isRefreshing = false;
          return accessToken;
        }).catch(e => {
          isRefreshing = false;
          throw e;
        });
      }
      try {
        const newToken = await refreshPromise;
        originalReq.headers.Authorization = `Bearer ${newToken}`;
        return api(originalReq);
      } catch (e) {
        // won't refresh -> redirect to login on caller side
        throw e;
      }
    }
    throw err;
  }
);

export default api;
