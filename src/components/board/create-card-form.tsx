'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useBoardStore } from '@/stores/board-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cardsApi } from '@/services/cards.service';

const createCardSchema = z.object({
	title: z
		.string()
		.min(1, 'Título é obrigatório')
		.max(200, 'Título muito longo'),
});

type CreateCardForm = z.infer<typeof createCardSchema>;

interface CreateCardFormProps {
	listId: string;
	onCancel: () => void;
	onSuccess: () => void;
}

export function CreateCardForm({
	listId,
	onCancel,
	onSuccess,
}: CreateCardFormProps) {
	const { addCard } = useBoardStore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateCardForm>({
		resolver: zodResolver(createCardSchema),
	});

	const createCardMutation = useMutation({
		mutationFn: (data: CreateCardForm) =>
			cardsApi.create({
				...data,
				listId,
			}),
		onSuccess: (response) => {
			addCard(response.data);
			reset();
			onSuccess();
			toast.success('Card criado');
		},
		onError: () => {
			toast.error('Erro ao criar card');
		},
	});

	const onSubmit = (data: CreateCardForm) => {
		createCardMutation.mutate(data);
	};

	return (
		<div className='bg-white rounded-lg p-3 border border-gray-200'>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-3'
			>
				<div>
					<Textarea
						placeholder='Digite um título para este cartão'
						rows={3}
						{...register('title')}
						className={`resize-none ${errors.title ? 'border-red-500' : ''}`}
						autoFocus
					/>
					{errors.title && (
						<p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>
					)}
				</div>

				<div className='flex space-x-2'>
					<Button
						type='submit'
						size='sm'
						disabled={createCardMutation.isPending}
						className='flex-1'
					>
						<Plus className='h-4 w-4 mr-1' />
						Adicionar cartão
					</Button>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						onClick={onCancel}
						className='flex-shrink-0'
					>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</form>
		</div>
	);
}
