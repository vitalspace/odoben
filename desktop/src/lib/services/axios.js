import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  
  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    // Send JWT token as Authorization header (Bearer token)
    // Use .set() if available (Axios 1.x), otherwise fallback to assignment
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('[Desktop Axios] Attached token to request:', config.url);
  } else {
    console.warn('[Desktop Axios] No token found in localStorage for request:', config.url);
  }
  return config;
});

export default instance;
