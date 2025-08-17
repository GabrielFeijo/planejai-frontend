export type BoardRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'OBSERVER';

export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	avatar?: string;
	createdAt: string;
}

export interface Board {
	id: string;
	title: string;
	description?: string;
	background?: string;
	visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
	createdAt: string;
	updatedAt: string;
	ownerId: string;
	owner: User;
	members: BoardMember[];
	lists: List[];
	activities?: Activity[];
}

export interface BoardMember {
	id: string;
	role: BoardRole;
	joinedAt: string;
	userId: string;
	user: User;
}

export interface List {
	id: string;
	title: string;
	position: number;
	createdAt: string;
	updatedAt: string;
	boardId: string;
	cards: Card[];
}

export interface Card {
	id: string;
	title: string;
	description?: string;
	position: number;
	dueDate?: string;
	isCompleted: boolean;
	priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	createdAt: string;
	updatedAt: string;
	listId: string;
	members: CardMember[];
	labels: Label[];
	attachments?: Attachment[];
	comments?: Comment[];
	activities?: Activity[];
	_count?: {
		comments: number;
		attachments: number;
	};
}

export interface CardMember {
	id: string;
	userId: string;
	user: User;
}

export interface Label {
	id: string;
	name: string;
	color: string;
	cardId: string;
}

export interface Attachment {
	id: string;
	filename: string;
	url: string;
	size: number;
	mimetype: string;
	createdAt: string;
	cardId: string;
}

export interface Comment {
	id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	userId: string;
	user: User;
	cardId: string;
}

export interface Activity {
	id: string;
	type: ActivityType;
	description: string;
	metadata?: any;
	createdAt: string;
	userId: string;
	user: User;
	boardId: string;
	cardId?: string;
}

export type ActivityType =
	| 'BOARD_CREATED'
	| 'BOARD_UPDATED'
	| 'BOARD_DELETED'
	| 'LIST_CREATED'
	| 'LIST_UPDATED'
	| 'LIST_DELETED'
	| 'LIST_MOVED'
	| 'CARD_CREATED'
	| 'CARD_UPDATED'
	| 'CARD_DELETED'
	| 'CARD_MOVED'
	| 'CARD_ASSIGNED'
	| 'CARD_UNASSIGNED'
	| 'CARD_COMPLETED'
	| 'CARD_REOPENED'
	| 'COMMENT_ADDED'
	| 'COMMENT_UPDATED'
	| 'COMMENT_DELETED'
	| 'MEMBER_ADDED'
	| 'MEMBER_REMOVED'
	| 'ATTACHMENT_ADDED'
	| 'ATTACHMENT_REMOVED';

export interface AuthUser {
	id: string;
	email: string;
	username: string;
	name: string;
	avatar?: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	username: string;
	name: string;
	password: string;
}

export interface AuthResponse {
	access_token: string;
	user: AuthUser;
}

export interface CreateBoardData {
	title: string;
	description?: string;
	background?: string;
	visibility?: 'PRIVATE' | 'PUBLIC' | 'TEAM';
}

export interface CreateListData {
	title: string;
	boardId: string;
}

export interface CreateCardData {
	title: string;
	description?: string;
	listId: string;
	dueDate?: string;
	priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface MoveCardData {
	position: number;
	listId?: string;
}

export interface InviteMemberData {
	userId: string;
	role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'OBSERVER';
}
