import { api } from './apiClient';
import {
	AuthResponse,
	AuthUser,
	LoginCredentials,
	RegisterData,
} from '@/types';

export const authApi = {
	login: (credentials: LoginCredentials) =>
		api.post<AuthResponse>('/auth/login', credentials),

	register: (data: RegisterData) =>
		api.post<AuthResponse>('/auth/register', data),

	me: () => api.get<AuthUser>('/auth/me'),
};
