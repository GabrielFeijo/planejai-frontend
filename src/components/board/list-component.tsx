'use client';

import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { List } from '@/types';
import { CardComponent } from './card-component';
import { CreateCardForm } from './create-card-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoardStore } from '@/stores/board-store';
import { Plus, MoreHorizontal, Check } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { listsApi } from '@/services/lists.service';

interface ListComponentProps {
	list: List;
}

export function ListComponent({ list }: ListComponentProps) {
	const [showCreateCard, setShowCreateCard] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(list.title);
	const queryClient = useQueryClient();
	const { currentBoard, updateList, removeList } = useBoardStore();

	const sortedCards = [...list.cards].sort((a, b) => a.position - b.position);

	const updateListMutation = useMutation({
		mutationFn: (data: { title: string }) => listsApi.update(list.id, data),
		onSuccess: () => {
			updateList(list.id, { title });
			setIsEditing(false);
			toast.success('Lista atualizada');
		},
		onError: () => {
			toast.error('Erro ao atualizar lista');
			setTitle(list.title);
		},
	});

	const deleteListMutation = useMutation({
		mutationFn: () => listsApi.delete(list.id),
		onSuccess: () => {
			removeList(list.id);
			queryClient.invalidateQueries({ queryKey: ['board', currentBoard?.id] });
			toast.success('Lista removida');
		},
		onError: () => {
			toast.error('Erro ao remover lista');
		},
	});

	const handleSaveTitle = () => {
		if (title.trim() && title !== list.title) {
			updateListMutation.mutate({ title: title.trim() });
		} else {
			setIsEditing(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSaveTitle();
		} else if (e.key === 'Escape') {
			setTitle(list.title);
			setIsEditing(false);
		}
	};

	return (
		<div className='w-72 bg-gray-100 rounded-lg flex-shrink-0'>
			<div className='p-3 border-b border-gray-200'>
				<div className='flex items-center justify-between'>
					{isEditing ? (
						<div className='flex-1 flex items-center space-x-2'>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								onKeyDown={handleKeyDown}
								onBlur={handleSaveTitle}
								className='h-8 text-sm font-medium'
								autoFocus
							/>
							<Button
								size='icon'
								variant='ghost'
								onClick={handleSaveTitle}
								className='h-8 w-8 text-green-600'
							>
								<Check className='h-4 w-4' />
							</Button>
						</div>
					) : (
						<h3
							className='font-medium text-gray-900 cursor-pointer flex-1'
							onClick={() => setIsEditing(true)}
						>
							{list.title}
						</h3>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='h-8 w-8 text-gray-500'
							>
								<MoreHorizontal className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={() => setIsEditing(true)}>
								Editar título
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => deleteListMutation.mutate()}
								className='text-red-600'
							>
								Excluir lista
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<Droppable
				droppableId={list.id}
				type='card'
			>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`p-2 min-h-[100px] space-y-2 ${
							snapshot.isDraggingOver ? 'bg-blue-50' : ''
						}`}
					>
						{sortedCards.map((card, index) => (
							<Draggable
								key={card.id}
								draggableId={card.id}
								index={index}
							>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										className={
											snapshot.isDragging ? 'rotate-2 shadow-xl z-50' : ''
										}
									>
										<CardComponent card={card} />
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}

						{showCreateCard && (
							<CreateCardForm
								listId={list.id}
								onCancel={() => setShowCreateCard(false)}
								onSuccess={() => setShowCreateCard(false)}
							/>
						)}
					</div>
				)}
			</Droppable>

			{!showCreateCard && (
				<div className='p-2'>
					<Button
						variant='ghost'
						onClick={() => setShowCreateCard(true)}
						className='w-full justify-start text-gray-600 hover:bg-gray-200'
					>
						<Plus className='h-4 w-4 mr-2' />
						Adicionar um cartão
					</Button>
				</div>
			)}
		</div>
	);
}
