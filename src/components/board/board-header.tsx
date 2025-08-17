'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users, Settings, Star, MoreHorizontal } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/getInitials';
import { InviteMemberModal } from './invite-members';
import { ManageMembersModal } from './manage-members';

interface BoardHeaderProps {
	board: Board;
}

type MemberModalType = 'invite' | 'manage' | null;

export function BoardHeader({ board }: BoardHeaderProps) {
	const router = useRouter();
	const [starred, setStarred] = useState(false);
	const [activeModal, setActiveModal] = useState<MemberModalType>(null);

	return (
		<>
			<header className='bg-black/30 backdrop-blur-sm border-b border-white/20'>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between h-14'>
						<div className='flex items-center space-x-4'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => router.push('/dashboard')}
								className='text-white hover:bg-white/10'
							>
								<ArrowLeft className='h-5 w-5' />
							</Button>

							<div>
								<h1 className='text-lg font-semibold text-white'>
									{board.title}
								</h1>
								{board.description && (
									<p className='text-sm text-white/70'>{board.description}</p>
								)}
							</div>
						</div>

						<div className='flex items-center space-x-3'>
							<div className='flex -space-x-2'>
								{board.members.slice(0, 5).map((member) => (
									<Avatar
										key={member.id}
										className='h-8 w-8 border-2 border-white'
									>
										<AvatarImage src={member.user.avatar} />
										<AvatarFallback className='text-xs bg-gray-500 text-white'>
											{getInitials(member.user.name)}
										</AvatarFallback>
									</Avatar>
								))}
								{board.members.length > 5 && (
									<div className='h-8 w-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center'>
										<span className='text-xs text-white'>
											+{board.members.length - 5}
										</span>
									</div>
								)}
							</div>

							<Button
								variant='ghost'
								size='sm'
								className='text-white hover:bg-white/10'
								onClick={() => setActiveModal('invite')}
							>
								<Users className='h-4 w-4 mr-1' />
								Convidar
							</Button>

							<Button
								variant='ghost'
								size='icon'
								onClick={() => setStarred(!starred)}
								className={`text-white hover:bg-white/10 ${starred ? 'text-yellow-400' : ''
									}`}
							>
								<Star className={`h-4 w-4 ${starred ? 'fill-current' : ''}`} />
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										size='icon'
										className='text-white hover:bg-white/10'
									>
										<MoreHorizontal className='h-4 w-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuItem>
										<Settings className='mr-2 h-4 w-4' />
										Configurações
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setActiveModal('manage')}>
										<Users className='mr-2 h-4 w-4' />
										Gerenciar membros
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</header>

			<InviteMemberModal
				board={board}
				onClose={() => setActiveModal(null)}
				open={activeModal === 'invite'}
			/>
			<ManageMembersModal
				board={board}
				onClose={() => setActiveModal(null)}
				open={activeModal === 'manage'}
			/>
		</>
	);
}
