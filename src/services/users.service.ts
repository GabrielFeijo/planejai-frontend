import { api } from './apiClient';
import { User } from '@/types';

export const usersApi = {
	search: (query: string) => api.get<User[]>(`/users/search?q=${query}`),
	getAll: () => api.get<User[]>('/users'),
};
