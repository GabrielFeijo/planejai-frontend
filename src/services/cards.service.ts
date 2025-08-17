import { api } from './apiClient';
import { Attachment, Card, CreateCardData, MoveCardData } from '@/types';

export const cardsApi = {
	getById: (id: string) => api.get<Card>(`/cards/${id}`),
	create: (data: CreateCardData) => api.post<Card>('/cards', data),
	update: (id: string, data: Partial<CreateCardData>) =>
		api.patch<Card>(`/cards/${id}`, data),
	delete: (id: string) => api.delete(`/cards/${id}`),

	move: (id: string, data: MoveCardData) =>
		api.patch<Card>(`/cards/${id}/move`, data),

	assignMember: (id: string, data: { userId: string }) =>
		api.post(`/cards/${id}/members`, data),
	unassignMember: (id: string, memberId: string) =>
		api.delete(`/cards/${id}/members/${memberId}`),

	uploadAttachment: (cardId: string, formData: FormData) =>
		api.post<Attachment>(`/cards/${cardId}/attachments`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),
	deleteAttachment: (cardId: string, attachmentId: string) =>
		api.delete(`/cards/${cardId}/attachments/${attachmentId}`),
	downloadAttachment: (cardId: string, attachmentId: string) =>
		api.get(`/cards/${cardId}/attachments/${attachmentId}/download`, {
			responseType: 'blob',
		}),
};
