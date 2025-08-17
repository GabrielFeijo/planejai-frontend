import { api } from './apiClient';
import { Comment } from '@/types';

export const commentsApi = {
	create: (data: { content: string; cardId: string }) =>
		api.post<Comment>('/comments', data),
	update: (id: string, data: { content: string }) =>
		api.patch<Comment>(`/comments/${id}`, data),
	delete: (id: string) => api.delete(`/comments/${id}`),
};
