import { create } from 'zustand';
import { Board, List, Card } from '@/types';

interface BoardState {
	currentBoard: Board | null;
	setCurrentBoard: (board: Board) => void;
	updateBoard: (updates: Partial<Board>) => void;

	addList: (list: List) => void;
	updateList: (listId: string, updates: Partial<List>) => void;
	removeList: (listId: string) => void;
	moveList: (listId: string, newPosition: number) => void;

	addCard: (card: Card) => void;
	updateCard: (cardId: string, updates: Partial<Card>) => void;
	removeCard: (cardId: string) => void;
	moveCard: (cardId: string, newListId: string, newPosition: number) => void;

	reset: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
	currentBoard: null,

	setCurrentBoard: (board) => set({ currentBoard: board }),

	updateBoard: (updates) => {
		const { currentBoard } = get();
		if (currentBoard) {
			set({ currentBoard: { ...currentBoard, ...updates } });
		}
	},

	addList: (list) => {
		const { currentBoard } = get();

		const existingList = currentBoard?.lists.find((l) => l.id === list.id);

		if (existingList) {
			return;
		}

		if (currentBoard) {
			set({
				currentBoard: {
					...currentBoard,
					lists: [...currentBoard.lists, list],
				},
			});
		}
	},

	updateList: (listId, updates) => {
		const { currentBoard } = get();
		if (currentBoard) {
			set({
				currentBoard: {
					...currentBoard,
					lists: currentBoard.lists.map((list) =>
						list.id === listId ? { ...list, ...updates } : list
					),
				},
			});
		}
	},

	removeList: (listId) => {
		const { currentBoard } = get();
		if (currentBoard) {
			set({
				currentBoard: {
					...currentBoard,
					lists: currentBoard.lists.filter((list) => list.id !== listId),
				},
			});
		}
	},

	moveList: (listId, newPosition) => {
		const { currentBoard } = get();
		if (currentBoard) {
			const lists = [...currentBoard.lists];
			const listIndex = lists.findIndex((list) => list.id === listId);
			if (listIndex !== -1) {
				lists[listIndex] = { ...lists[listIndex], position: newPosition };
				lists.sort((a, b) => a.position - b.position);
				set({
					currentBoard: {
						...currentBoard,
						lists,
					},
				});
			}
		}
	},

	addCard: (card) => {
		const { currentBoard } = get();
		if (currentBoard) {
			const existingCard = currentBoard.lists
				.find((list) => list.id === card.listId)
				?.cards.find((c) => c.id === card.id);

			if (existingCard) {
				return;
			}

			set({
				currentBoard: {
					...currentBoard,
					lists: currentBoard.lists.map((list) =>
						list.id === card.listId
							? { ...list, cards: [...list.cards, card] }
							: list
					),
				},
			});
		}
	},

	updateCard: (cardId, updates) => {
		const { currentBoard } = get();
		if (currentBoard) {
			set({
				currentBoard: {
					...currentBoard,
					lists: currentBoard.lists.map((list) => ({
						...list,
						cards: list.cards.map((card) =>
							card.id === cardId ? { ...card, ...updates } : card
						),
					})),
				},
			});
		}
	},

	removeCard: (cardId) => {
		const { currentBoard } = get();
		if (currentBoard) {
			set({
				currentBoard: {
					...currentBoard,
					lists: currentBoard.lists.map((list) => ({
						...list,
						cards: list.cards.filter((card) => card.id !== cardId),
					})),
				},
			});
		}
	},

	moveCard: (cardId, newListId, newPosition) => {
		const { currentBoard } = get();
		if (currentBoard) {
			let cardToMove: Card | null = null;
			const listsWithCardRemoved = currentBoard.lists.map((list) => ({
				...list,
				cards: list.cards.filter((card) => {
					if (card.id === cardId) {
						cardToMove = card;
						return false;
					}
					return true;
				}),
			}));

			if (cardToMove) {
				const updatedCard = {
					...(cardToMove as Card),
					listId: newListId,
					position: newPosition,
				};
				const finalLists = listsWithCardRemoved.map((list) =>
					list.id === newListId
						? {
								...list,
								cards: [...list.cards, updatedCard].sort(
									(a, b) => a.position - b.position
								),
						  }
						: list
				);

				set({
					currentBoard: {
						...currentBoard,
						lists: finalLists,
					},
				});
			}
		}
	},

	reset: () => set({ currentBoard: null }),
}));
