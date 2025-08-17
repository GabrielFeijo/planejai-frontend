'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { boardsApi } from '@/services/boards.service';

const createBoardSchema = z.object({
	title: z
		.string()
		.min(1, 'Título é obrigatório')
		.max(100, 'Título muito longo'),
	description: z.string().max(500, 'Descrição muito longa').optional(),
	background: z.string().optional(),
});

type CreateBoardForm = z.infer<typeof createBoardSchema>;

const backgroundOptions = [
	{
		value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		label: 'Azul Roxo',
	},
	{ value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Rosa' },
	{
		value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		label: 'Azul Claro',
	},
	{
		value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		label: 'Verde',
	},
	{
		value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
		label: 'Rosa Amarelo',
	},
	{
		value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
		label: 'Pastel',
	},
];

export function CreateBoardModal({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
	const [selectedBackground, setSelectedBackground] = useState(
		backgroundOptions[0].value
	);
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateBoardForm>({
		resolver: zodResolver(createBoardSchema),
		defaultValues: {
			background: selectedBackground,
		},
	});

	const createBoardMutation = useMutation({
		mutationFn: (data: CreateBoardForm) => boardsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['boards'] });
			toast.success('Quadro criado com sucesso!');
			setIsOpen(false);
			reset();
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Erro ao criar quadro');
		},
	});

	const onSubmit = (data: CreateBoardForm) => {
		createBoardMutation.mutate({
			...data,
			background: selectedBackground,
		});
	};

	return (
		<>
			<Button
				onClick={() => setIsOpen(true)}
				className='fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg'
				size='icon'
			>
				<Plus className='h-6 w-6' />
			</Button>

			<Dialog
				open={isOpen}
				onOpenChange={setIsOpen}
			>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Criar novo quadro</DialogTitle>
					</DialogHeader>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-4'
					>
						<div>
							<Input
								placeholder='Título do quadro'
								{...register('title')}
								className={errors.title ? 'border-red-500' : ''}
							/>
							{errors.title && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.title.message}
								</p>
							)}
						</div>

						<div>
							<Textarea
								placeholder='Descrição (opcional)'
								rows={3}
								{...register('description')}
								className={errors.description ? 'border-red-500' : ''}
							/>
							{errors.description && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.description.message}
								</p>
							)}
						</div>

						<div>
							<label className='text-sm font-medium mb-3 block'>
								Fundo do quadro
							</label>
							<div className='grid grid-cols-3 gap-2'>
								{backgroundOptions.map((option) => (
									<button
										key={option.value}
										type='button'
										onClick={() => setSelectedBackground(option.value)}
										className={`h-16 rounded-lg border-2 transition-all ${
											selectedBackground === option.value
												? 'border-blue-500 ring-2 ring-blue-200'
												: 'border-gray-200 hover:border-gray-300'
										}`}
										style={{ background: option.value }}
									>
										<span className='sr-only'>{option.label}</span>
									</button>
								))}
							</div>
						</div>

						<div className='flex gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsOpen(false)}
								className='flex-1'
							>
								Cancelar
							</Button>
							<Button
								type='submit'
								disabled={createBoardMutation.isPending}
								className='flex-1'
							>
								{createBoardMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Criando...
									</>
								) : (
									'Criar quadro'
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
