'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/types';
import { useBoardStore } from '@/stores/board-store';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import {
	Calendar,
	User,
	Paperclip,
	Send,
	CheckSquare,
	Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { cardsApi } from '@/services/cards.service';
import { commentsApi } from '@/services/comments.service';
import { formatDateTime } from '@/utils/formatDate';
import { getInitials } from '@/utils/getInitials';
import { getPriorityColor, getPriorityText } from '@/utils/getPriority';

const commentSchema = z.object({
	content: z.string().min(1, 'Comentário não pode estar vazio'),
});

type CommentForm = z.infer<typeof commentSchema>;

interface CardModalProps {
	card: Card;
	open: boolean;
	onClose: () => void;
}

export function CardModal({ card, open, onClose }: CardModalProps) {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [title, setTitle] = useState(card.title);
	const [description, setDescription] = useState(card.description || '');
	const { user } = useAuthStore();
	const { updateCard } = useBoardStore();
	const queryClient = useQueryClient();

	const { data: detailedCard, isLoading } = useQuery({
		queryKey: ['card', card.id],
		queryFn: () => cardsApi.getById(card.id).then((res) => res.data),
		enabled: open,
	});

	const currentCard = detailedCard || card;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CommentForm>({
		resolver: zodResolver(commentSchema),
	});

	const updateCardMutation = useMutation({
		mutationFn: (data: any) => cardsApi.update(card.id, data),
		onSuccess: (response) => {
			updateCard(card.id, response.data);
			toast.success('Card atualizado');
		},
		onError: () => {
			toast.error('Erro ao atualizar card');
		},
	});

	const createCommentMutation = useMutation({
		mutationFn: (data: CommentForm) =>
			commentsApi.create({
				...data,
				cardId: card.id,
			}),
		onSuccess: () => {
			reset();
			queryClient.invalidateQueries({ queryKey: ['card', card.id] });
			toast.success('Comentário adicionado');
		},
		onError: () => {
			toast.error('Erro ao adicionar comentário');
		},
	});

	const handleSaveTitle = () => {
		if (title.trim() && title !== card.title) {
			updateCardMutation.mutate({ title: title.trim() });
		}
		setIsEditingTitle(false);
	};

	const handleSaveDescription = () => {
		if (description !== (card.description || '')) {
			updateCardMutation.mutate({
				description: description.trim() || undefined,
			});
		}
		setIsEditingDescription(false);
	};

	const handleToggleCompleted = () => {
		updateCardMutation.mutate({ isCompleted: !card.isCompleted });
	};

	const onSubmitComment = (data: CommentForm) => {
		createCommentMutation.mutate(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}
		>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex items-start space-x-3'>
						<CheckSquare className='h-5 w-5 text-gray-600 mt-1' />
						<div className='flex-1'>
							{isEditingTitle ? (
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									onBlur={handleSaveTitle}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleSaveTitle();
										if (e.key === 'Escape') {
											setTitle(card.title);
											setIsEditingTitle(false);
										}
									}}
									autoFocus
									className='text-lg font-semibold w-3/4'
								/>
							) : (
								<DialogTitle
									className='cursor-pointer hover:bg-gray-50 p-2 rounded -m-2 w-3/4'
									onClick={() => setIsEditingTitle(true)}
								>
									{card.title}
								</DialogTitle>
							)}
							<p className='text-sm text-gray-500 mt-1'>
								na lista <span className='font-medium'>Lista</span>
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className='grid grid-cols-3 gap-6'>
					<div className='col-span-2 space-y-6'>
						<div className='flex items-center space-x-4'>
							{card.isCompleted && (
								<Badge className='bg-green-100 text-green-800'>
									✓ Concluído
								</Badge>
							)}
							{card.priority !== 'NONE' && (
								<Badge className={getPriorityColor(card.priority)}>
									{getPriorityText(card.priority)}
								</Badge>
							)}
							{card.dueDate && (
								<div className='flex items-center space-x-1 text-sm text-gray-600'>
									<Calendar className='h-4 w-4' />
									<span>{formatDateTime(card.dueDate)}</span>
								</div>
							)}
						</div>

						{currentCard.members && currentCard.members.length > 0 && (
							<div>
								<h3 className='text-sm font-medium text-gray-900 mb-2'>
									Membros
								</h3>
								<div className='flex space-x-2'>
									{currentCard.members.map((member) => (
										<div
											key={member.id}
											className='flex items-center space-x-2'
										>
											<Avatar className='h-8 w-8'>
												<AvatarImage src={member.user.avatar} />
												<AvatarFallback>
													{getInitials(member.user.name)}
												</AvatarFallback>
											</Avatar>
											<span className='text-sm'>{member.user.name}</span>
										</div>
									))}
								</div>
							</div>
						)}

						<div>
							<h3 className='text-sm font-medium text-gray-900 mb-2'>
								Descrição
							</h3>
							{isEditingDescription ? (
								<div className='space-y-2'>
									<Textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={4}
										placeholder='Adicione uma descrição mais detalhada...'
										autoFocus
									/>
									<div className='flex space-x-2'>
										<Button
											size='sm'
											onClick={handleSaveDescription}
										>
											Salvar
										</Button>
										<Button
											size='sm'
											variant='ghost'
											onClick={() => {
												setDescription(card.description || '');
												setIsEditingDescription(false);
											}}
										>
											Cancelar
										</Button>
									</div>
								</div>
							) : (
								<div
									className='min-h-[60px] p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100'
									onClick={() => setIsEditingDescription(true)}
								>
									{card.description ? (
										<p className='whitespace-pre-wrap text-sm'>
											{card.description}
										</p>
									) : (
										<p className='text-gray-500 text-sm'>
											Adicione uma descrição mais detalhada...
										</p>
									)}
								</div>
							)}
						</div>

						<div>
							<h3 className='text-sm font-medium text-gray-900 mb-3'>
								Atividade
							</h3>

							<div className='space-y-4'>
								{currentCard.comments?.map((comment) => (
									<div
										key={comment.id}
										className='flex space-x-3'
									>
										<Avatar className='h-8 w-8'>
											<AvatarImage src={comment.user.avatar} />
											<AvatarFallback>
												{getInitials(comment.user.name)}
											</AvatarFallback>
										</Avatar>
										<div className='flex-1'>
											<div className='bg-white border rounded-lg p-3'>
												<div className='flex items-center space-x-2 mb-2'>
													<span className='font-medium text-sm'>
														{comment.user.name}
													</span>
													<span className='text-xs text-gray-500'>
														{formatDateTime(comment.createdAt)}
													</span>
												</div>
												<p className='text-sm whitespace-pre-wrap'>
													{comment.content}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className='flex space-x-3 mt-4'>
								<Avatar className='h-8 w-8'>
									<AvatarImage src={user?.avatar} />
									<AvatarFallback>
										{user?.name ? getInitials(user.name) : 'U'}
									</AvatarFallback>
								</Avatar>
								<form
									onSubmit={handleSubmit(onSubmitComment)}
									className='flex-1'
								>
									<div className='space-y-2'>
										<Textarea
											placeholder='Escreva um comentário...'
											{...register('content')}
											className='min-h-[80px]'
										/>
										<Button
											type='submit'
											size='sm'
											disabled={createCommentMutation.isPending}
										>
											<Send className='h-4 w-4 mr-1' />
											Comentar
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>

					<div className='space-y-4'>
						<div>
							<h3 className='text-sm font-medium text-gray-900 mb-2'>Ações</h3>
							<div className='space-y-2'>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleToggleCompleted}
									className='w-full justify-start'
								>
									{card.isCompleted ? (
										<>
											<Square className='h-4 w-4 mr-2' />
											Marcar como pendente
										</>
									) : (
										<>
											<CheckSquare className='h-4 w-4 mr-2' />
											Marcar como concluído
										</>
									)}
								</Button>
								<Button
									variant='ghost'
									size='sm'
									className='w-full justify-start'
								>
									<User className='h-4 w-4 mr-2' />
									Membros
								</Button>
								<Button
									variant='ghost'
									size='sm'
									className='w-full justify-start'
								>
									<Calendar className='h-4 w-4 mr-2' />
									Data de vencimento
								</Button>
								<Button
									variant='ghost'
									size='sm'
									className='w-full justify-start'
								>
									<Paperclip className='h-4 w-4 mr-2' />
									Anexo
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
