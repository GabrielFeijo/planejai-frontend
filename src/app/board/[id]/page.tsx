'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useAuthStore } from '@/stores/auth-store';
import { useBoardStore } from '@/stores/board-store';
import { useWebSocket } from '@/hooks/use-websocket';
import { BoardHeader } from '@/components/board/board-header';
import { BoardLists } from '@/components/board/board-lists';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { boardsApi } from '@/services/boards.service';
import { cardsApi } from '@/services/cards.service';
import { generatePosition } from '@/utils/generatePosition';
import { InviteMemberModal } from '@/components/board/invite-members';

export default function BoardPage() {
	const params = useParams();
	const router = useRouter();
	const boardId = params.id as string;
	const { isAuthenticated } = useAuthStore();
	const { currentBoard, setCurrentBoard, moveCard } = useBoardStore();
	const { joinBoard, leaveBoard } = useWebSocket();

	const {
		data: board,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['board', boardId],
		queryFn: () => boardsApi.getById(boardId).then((res) => res.data),
		enabled: isAuthenticated && !!boardId,
	});

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/auth/login');
			return;
		}

		if (board) {
			if (!currentBoard || currentBoard.id !== board.id) {
				setCurrentBoard(board);
				joinBoard(boardId);
			}
		}
	}, [
		isAuthenticated,
		board,
		boardId,
		currentBoard,
		setCurrentBoard,
		joinBoard,
		leaveBoard,
		router,
	]);

	const handleDragEnd = async (result: DropResult) => {
		const { destination, source, draggableId, type } = result;

		if (!destination) return;

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		if (type === 'card') {
			const sourceListId = source.droppableId;
			const destListId = destination.droppableId;
			const cardId = draggableId;

			if (!currentBoard) return;

			const sourceLi = currentBoard.lists.find(
				(list) => list.id === sourceListId
			);
			const destList = currentBoard.lists.find(
				(list) => list.id === destListId
			);

			if (!sourceLi || !destList) return;

			const destCards = destList.cards.filter((card) => card.id !== cardId);
			const beforeCard = destCards[destination.index - 1];
			const afterCard = destCards[destination.index];

			const newPosition = generatePosition(
				beforeCard?.position,
				afterCard?.position
			);

			moveCard(cardId, destListId, newPosition);

			try {
				await cardsApi.move(cardId, {
					position: newPosition,
					listId: destListId !== sourceListId ? destListId : undefined,
				});
			} catch (error) {
				toast.error('Erro ao mover card');
				window.location.reload();
			}
		}
	};

	if (!isAuthenticated) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (error || !currentBoard) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-gray-900 mb-2'>
						Quadro não encontrado
					</h2>
					<p className='text-gray-600 mb-4'>
						O quadro que você está procurando não existe ou você não tem
						permissão para acessá-lo.
					</p>
					<button
						onClick={() => router.push('/dashboard')}
						className='text-blue-600 hover:underline'
					>
						Voltar ao dashboard
					</button>
				</div>
			</div>
		);
	}

	const boardStyle = currentBoard.background?.startsWith('http')
		? { backgroundImage: `url(${currentBoard.background})` }
		: { background: currentBoard.background };

	return (
		<div
			className='min-h-screen bg-cover bg-center bg-no-repeat'
			style={boardStyle}
		>
			<div className='min-h-screen bg-black/20'>
				<BoardHeader board={currentBoard} />
				<DragDropContext onDragEnd={handleDragEnd}>
					<BoardLists lists={currentBoard.lists} />
				</DragDropContext>
			</div>
		</div>
	);
}
