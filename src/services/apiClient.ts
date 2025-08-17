import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	const token = Cookies.get('auth-token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			Cookies.remove('auth-token');
			window.location.href = '/auth/login';
		}
		return Promise.reject(error);
	}
);
