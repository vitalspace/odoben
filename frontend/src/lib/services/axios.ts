import axios, { type AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
});

// Helper function to get current token
export const getAuthToken = (): string | null => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('auth_token');
	}
	return null;
};

// Add request interceptor to include JWT token in Authorization header
axiosInstance.interceptors.request.use(
	(config) => {
		// Only access localStorage on the client side
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('auth_token');
			// console.log('Interceptor: Token found:', !!token);
			if (token) {
				config.headers = config.headers || {};
				config.headers.Authorization = `Bearer ${token}`;
				// console.log('Interceptor: Authorization header set');
			} else {
				console.warn('Interceptor: No token found in localStorage');
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default axiosInstance;
