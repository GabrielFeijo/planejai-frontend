import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useBoardStore } from '@/stores/board-store';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function useWebSocket() {
	const socketRef = useRef<Socket | null>(null);
	const { token, user } = useAuthStore();
	const {
		currentBoard,
		updateBoard,
		addList,
		updateList,
		removeList,
		addCard,
		moveCard,
		updateCard,
		removeCard,
	} = useBoardStore();

	useEffect(() => {
		if (!token || !user) return;

		socketRef.current = io(SOCKET_URL, {
			auth: {
				token: token,
			},
		});

		const socket = socketRef.current;

		socket.on('connect', () => {
			console.log('Connected to WebSocket');
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from WebSocket');
		});

		socket.on('error', (error) => {
			toast.error(error.message || 'Erro de conexão');
		});

		socket.on('board-updated', (data) => {
			updateBoard(data);
		});

		socket.on('list-created', (data) => {
			addList(data);
		});

		socket.on('list-updated', (data) => {
			updateList(data.id, data);
		});

		socket.on('list-deleted', (data) => {
			removeList(data.id);
		});

		socket.on('card-created', (data) => {
			addCard(data);
		});

		socket.on('card-updated', (data) => {
			updateCard(data.id, data);
		});

		socket.on('card-deleted', (data) => {
			removeCard(data.id);
		});

		socket.on('card-moved', (data) => {
			moveCard(data.id, data.listId, data.position);
		});

		socket.on('new-activity', (activity) => {
			if (currentBoard) {
				updateBoard({
					activities: [activity, ...(currentBoard.activities || [])],
				});
			}
		});

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, user]);

	const joinBoard = (boardId: string) => {
		if (socketRef.current) {
			socketRef.current.emit('join-board', { boardId });
		}
	};

	const leaveBoard = (boardId: string) => {
		if (socketRef.current) {
			socketRef.current.emit('leave-board', { boardId });
		}
	};

	return {
		joinBoard,
		leaveBoard,
	};
}
