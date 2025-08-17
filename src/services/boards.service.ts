import { api } from './apiClient';
import { Board, BoardRole, CreateBoardData, InviteMemberData } from '@/types';

export const boardsApi = {
	getAll: () => api.get<Board[]>('/boards'),
	getById: (id: string) => api.get<Board>(`/boards/${id}`),
	create: (data: CreateBoardData) => api.post<Board>('/boards', data),
	update: (id: string, data: Partial<CreateBoardData>) =>
		api.patch<Board>(`/boards/${id}`, data),
	delete: (id: string) => api.delete(`/boards/${id}`),
	inviteMember: (id: string, data: InviteMemberData) =>
		api.post(`/boards/${id}/members`, data),
	updateMemberRole: (boardId: string, memberId: string, role: BoardRole) =>
		api.patch(`/boards/${boardId}/members/${memberId}`, { role }),
	removeMember: (id: string, memberId: string) =>
		api.delete(`/boards/${id}/members/${memberId}`),
};
