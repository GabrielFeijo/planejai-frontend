'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	SelectRoot,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Crown, Shield, User, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { boardsApi } from '@/services/boards.service';
import { getInitials } from '@/utils/getInitials';
import { formatDateTime } from '@/utils/formatDate';
import { BoardRole, BoardMember, Board } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

interface ManageMembersModalProps {
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

const roleIcons = {
	OWNER: Crown,
	ADMIN: Shield,
	MEMBER: User,
	OBSERVER: Eye,
};

export function ManageMembersModal({
	board,
	open,
	onClose,
}: ManageMembersModalProps) {
	const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(
		null
	);
	const { user: currentUser } = useAuthStore();
	const queryClient = useQueryClient();

	const updateMemberRoleMutation = useMutation({
		mutationFn: ({ memberId, role }: { memberId: string; role: BoardRole }) =>
			boardsApi.updateMemberRole(board.id, memberId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['board', board.id] });
			queryClient.invalidateQueries({ queryKey: ['boards'] });
			toast.success('Função do membro atualizada');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Erro ao atualizar função');
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: (memberId: string) =>
			boardsApi.removeMember(board.id, memberId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['board', board.id] });
			queryClient.invalidateQueries({ queryKey: ['boards'] });
			toast.success('Membro removido do board');
			setMemberToRemove(null);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Erro ao remover membro');
		},
	});

	const handleRoleChange = (member: BoardMember, newRole: BoardRole) => {
		if (newRole !== member.role) {
			updateMemberRoleMutation.mutate({
				memberId: member.userId,
				role: newRole,
			});

			board.members = board.members?.map((m) =>
				m.userId === member.userId ? { ...m, role: newRole } : m
			);
		}
	};

	const handleRemoveMember = (member: BoardMember) => {
		removeMemberMutation.mutate(member.userId);

		board.members = board.members?.filter((m) => m.userId !== member.userId);
	};

	const canEditMember = (member: BoardMember) => {
		if (member.userId === currentUser?.id) return false;

		const currentUserMember = board.members?.find(
			(m) => m.userId === currentUser?.id
		);
		if (
			!currentUserMember ||
			!['OWNER', 'ADMIN'].includes(currentUserMember.role)
		) {
			return false;
		}

		if (currentUserMember.role === 'OWNER') return true;
		if (currentUserMember.role === 'ADMIN' && member.role !== 'OWNER')
			return true;

		return false;
	};

	const getAvailableRoles = (
		currentUserRole: BoardRole,
		targetMemberRole: BoardRole
	): BoardRole[] => {
		const allRoles: BoardRole[] = ['OWNER', 'ADMIN', 'MEMBER', 'OBSERVER'];

		if (currentUserRole === 'OWNER') {
			return allRoles;
		}

		if (currentUserRole === 'ADMIN' && targetMemberRole !== 'OWNER') {
			return ['ADMIN', 'MEMBER', 'OBSERVER'];
		}

		return [];
	};

	const currentUserMember = board.members?.find(
		(m) => m.userId === currentUser?.id
	);
	const sortedMembers = [...(board.members || [])].sort((a, b) => {
		const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2, OBSERVER: 3 };
		return roleOrder[a.role] - roleOrder[b.role];
	});

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={onClose}
			>
				<DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center space-x-2'>
							<Users className='h-5 w-5' />
							<span>Gerenciar membros ({board.members?.length || 0})</span>
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						{sortedMembers.map((member) => {
							const RoleIcon = roleIcons[member.role];
							const canEdit = canEditMember(member);
							const isCurrentUser = member.userId === currentUser?.id;
							const availableRoles = currentUserMember
								? getAvailableRoles(currentUserMember.role, member.role)
								: [];

							return (
								<div
									key={member.id}
									className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
								>
									<div className='flex items-center space-x-3 flex-1'>
										<Avatar className='h-10 w-10'>
											<AvatarImage src={member.user.avatar} />
											<AvatarFallback>
												{getInitials(member.user.name)}
											</AvatarFallback>
										</Avatar>

										<div className='flex-1'>
											<div className='flex items-center space-x-2'>
												<h3 className='font-medium'>
													{member.user.name}
													{isCurrentUser && (
														<span className='text-sm text-gray-500 ml-1'>
															(você)
														</span>
													)}
												</h3>
												<Badge
													variant='secondary'
													className='flex items-center space-x-1'
												>
													<RoleIcon className='h-3 w-3' />
													<span>{roleLabels[member.role]}</span>
												</Badge>
											</div>
											<p className='text-sm text-gray-500'>
												@{member.user.username}
											</p>
											<p className='text-xs text-gray-400'>
												Entrou em {formatDateTime(member.joinedAt)}
											</p>
										</div>
									</div>

									<div className='flex items-center space-x-2'>
										{canEdit && availableRoles.length > 0 && (
											<SelectRoot
												value={member.role}
												onValueChange={(value: BoardRole) =>
													handleRoleChange(member, value)
												}
												disabled={updateMemberRoleMutation.isPending}
											>
												<SelectTrigger className='w-40'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{availableRoles.map((role) => {
														const Icon = roleIcons[role];
														return (
															<SelectItem
																key={role}
																value={role}
															>
																<div className='flex items-center space-x-2'>
																	<Icon className='h-4 w-4' />
																	<div className='font-medium'>
																		{roleLabels[role]}
																	</div>
																</div>
															</SelectItem>
														);
													})}
												</SelectContent>
											</SelectRoot>
										)}

										{canEdit && (
											<Button
												variant='ghost'
												size='sm'
												onClick={() => setMemberToRemove(member)}
												className='text-red-600 hover:text-red-700 hover:bg-red-50'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										)}
									</div>
								</div>
							);
						})}

						{(!board.members || board.members.length === 0) && (
							<div className='text-center py-8 text-gray-500'>
								<Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>Nenhum membro encontrado</p>
							</div>
						)}
					</div>

					<div className='flex justify-end pt-4 border-t'>
						<Button
							variant='ghost'
							onClick={onClose}
						>
							Fechar
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!memberToRemove}
				onOpenChange={() => setMemberToRemove(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remover membro</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza que deseja remover{' '}
							<strong>{memberToRemove?.user.name}</strong> do board? Esta ação
							não pode ser desfeita.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								memberToRemove && handleRemoveMember(memberToRemove)
							}
							className='bg-red-600 hover:bg-red-700'
							disabled={removeMemberMutation.isPending}
						>
							{removeMemberMutation.isPending ? 'Removendo...' : 'Remover'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
