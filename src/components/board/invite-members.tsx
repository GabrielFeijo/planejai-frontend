'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { boardsApi } from '@/services/boards.service';
import { usersApi } from '@/services/users.service';
import { getInitials } from '@/utils/getInitials';
import { User, Board, BoardRole } from '@/types';
import {
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Select } from '@radix-ui/react-select';

const inviteMemberSchema = z.object({
	userId: z.string().min(1, 'Selecione um usuário'),
	role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'OBSERVER']).optional(),
});

type InviteMemberForm = z.infer<typeof inviteMemberSchema>;

interface InviteMemberModalProps {
	board: Board;
	open: boolean;
	onClose: () => void;
}

const roleLabels = {
	OWNER: 'Proprietário',
	ADMIN: 'Administrador',
	MEMBER: 'Membro',
	OBSERVER: 'Observador',
};

const roleDescriptions = {
	OWNER: 'Acesso total ao board',
	ADMIN: 'Pode gerenciar membros e configurações',
	MEMBER: 'Pode editar cards e listas',
	OBSERVER: 'Apenas visualização',
};

export function InviteMemberModal({
	board,
	open,
	onClose,
}: InviteMemberModalProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const queryClient = useQueryClient();

	const {
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<InviteMemberForm>({
		resolver: zodResolver(inviteMemberSchema),
		defaultValues: {
			role: 'MEMBER',
		},
	});

	const selectedRole = watch('role');

	const { data: users = [], isLoading: isLoadingUsers } = useQuery({
		queryKey: ['users', searchTerm],
		queryFn: () => usersApi.search(searchTerm).then((res) => res.data),
		enabled: open && searchTerm.length > 0,
	});

	const existingMemberIds =
		board.members?.map((member) => member.user.id) || [];
	const availableUsers = users.filter(
		(user) => !existingMemberIds.includes(user.id)
	);

	const inviteMemberMutation = useMutation({
		mutationFn: (data: InviteMemberForm) =>
			boardsApi.inviteMember(board.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['board', board.id] });
			queryClient.invalidateQueries({ queryKey: ['boards'] });
			toast.success('Membro convidado com sucesso');
			handleClose();
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Erro ao convidar membro');
		},
	});

	const handleClose = () => {
		reset();
		setSearchTerm('');
		setSelectedUser(null);
		onClose();
	};

	const handleSelectUser = (user: User) => {
		setSelectedUser(user);
		setValue('userId', user.id);
		setSearchTerm('');
	};

	const handleRemoveSelectedUser = () => {
		setSelectedUser(null);
		setValue('userId', '');
	};

	const onSubmit = (data: InviteMemberForm) => {
		inviteMemberMutation.mutate(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}
		>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle className='flex items-center space-x-2'>
						<UserPlus className='h-5 w-5' />
						<span>Convidar membro</span>
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'
				>
					<div>
						<label className='text-sm font-medium text-gray-900 mb-2 block'>
							Usuário
						</label>

						{selectedUser ? (
							<div className='flex items-center justify-between p-3 border rounded-lg bg-gray-50'>
								<div className='flex items-center space-x-3'>
									<Avatar className='h-8 w-8'>
										<AvatarImage src={selectedUser.avatar} />
										<AvatarFallback>
											{getInitials(selectedUser.name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className='text-sm font-medium'>{selectedUser.name}</p>
										<p className='text-xs text-gray-500'>
											{selectedUser.email}
										</p>
									</div>
								</div>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={handleRemoveSelectedUser}
								>
									<X className='h-4 w-4' />
								</Button>
							</div>
						) : (
							<div className='relative'>
								<Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
								<Input
									placeholder='Pesquisar por nome ou email...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='pl-10'
								/>

								{searchTerm && (
									<div className='absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
										{isLoadingUsers ? (
											<div className='p-3 text-center text-sm text-gray-500'>
												Buscando usuários...
											</div>
										) : availableUsers.length > 0 ? (
											availableUsers.map((user) => (
												<button
													key={user.id}
													type='button'
													onClick={() => handleSelectUser(user)}
													className='w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left'
												>
													<Avatar className='h-8 w-8'>
														<AvatarImage src={user.avatar} />
														<AvatarFallback>
															{getInitials(user.name)}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className='text-sm font-medium'>{user.name}</p>
														<p className='text-xs text-gray-500'>
															{user.email}
														</p>
													</div>
												</button>
											))
										) : (
											<div className='p-3 text-center text-sm text-gray-500'>
												{searchTerm.length < 2
													? 'Digite pelo menos 2 caracteres'
													: 'Nenhum usuário encontrado'}
											</div>
										)}
									</div>
								)}
							</div>
						)}

						{errors.userId && (
							<p className='text-sm text-red-500 mt-1'>
								{errors.userId.message}
							</p>
						)}
					</div>

					<div>
						<label className='text-sm font-medium text-gray-900 mb-2 block'>
							Função
						</label>
						<Select
							value={selectedRole}
							onValueChange={(value: BoardRole) => setValue('role', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Selecione uma função' />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(roleLabels).map(([role, label]) => (
									<SelectItem
										key={role}
										value={role}
									>
										<div>
											<div className='font-medium'>{label}</div>
											<div className='text-xs text-gray-500'>
												{roleDescriptions[role as BoardRole]}
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='flex space-x-2 pt-4'>
						<Button
							type='submit'
							disabled={inviteMemberMutation.isPending}
							className='flex-1'
						>
							{inviteMemberMutation.isPending ? 'Convidando...' : 'Convidar'}
						</Button>
						<Button
							type='button'
							variant='ghost'
							onClick={handleClose}
							disabled={inviteMemberMutation.isPending}
						>
							Cancelar
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
