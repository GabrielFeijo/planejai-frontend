'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useBoardStore } from '@/stores/board-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { listsApi } from '@/services/lists.service';

const createListSchema = z.object({
	title: z
		.string()
		.min(1, 'Título é obrigatório')
		.max(100, 'Título muito longo'),
});

type CreateListForm = z.infer<typeof createListSchema>;

interface CreateListFormProps {
	onCancel: () => void;
}

export function CreateListForm({ onCancel }: CreateListFormProps) {
	const { currentBoard, addList } = useBoardStore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateListForm>({
		resolver: zodResolver(createListSchema),
	});

	const createListMutation = useMutation({
		mutationFn: (data: CreateListForm) =>
			listsApi.create({
				...data,
				boardId: currentBoard!.id,
			}),
		onSuccess: (response) => {
			addList({ ...response.data, cards: [] });
			reset();
			onCancel();
			toast.success('Lista criada');
		},
		onError: () => {
			toast.error('Erro ao criar lista');
		},
	});

	const onSubmit = (data: CreateListForm) => {
		createListMutation.mutate(data);
	};

	return (
		<div className='w-72 bg-gray-100 rounded-lg p-3 flex-shrink-0'>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-3'
			>
				<div>
					<Input
						placeholder='Digite o título da lista'
						{...register('title')}
						className={errors.title ? 'border-red-500' : ''}
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
						disabled={createListMutation.isPending}
						className='flex-1'
					>
						<Plus className='h-4 w-4 mr-1' />
						Adicionar lista
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
