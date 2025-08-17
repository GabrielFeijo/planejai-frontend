import { api } from './apiClient';
import { List, CreateListData } from '@/types';

export const listsApi = {
	create: (data: CreateListData) => api.post<List>('/lists', data),
	update: (id: string, data: Partial<CreateListData>) =>
		api.patch<List>(`/lists/${id}`, data),
	delete: (id: string) => api.delete(`/lists/${id}`),

	move: (id: string, data: { position: number }) =>
		api.patch<List>(`/lists/${id}/move`, data),
};
