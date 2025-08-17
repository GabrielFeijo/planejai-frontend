'use client';

import Link from 'next/link';
import { Board } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Lock, Globe } from 'lucide-react';
import { getInitials } from '@/utils/getInitials';

interface BoardCardProps {
	board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
	const getVisibilityIcon = () => {
		switch (board.visibility) {
			case 'PUBLIC':
				return <Globe className='h-3 w-3' />;
			case 'TEAM':
				return <Users className='h-3 w-3' />;
			default:
				return <Lock className='h-3 w-3' />;
		}
	};

	const getBoardBackground = () => {
		if (board.background?.startsWith('http')) {
			return {
				backgroundImage: `url(${board.background})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			};
		}
		return {
			background:
				board.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		};
	};

	return (
		<Link href={`/board/${board.id}`}>
			<div
				className='h-24 rounded-lg p-3 cursor-pointer relative overflow-hidden group hover:shadow-lg transition-shadow'
				style={getBoardBackground()}
			>
				<div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors' />

				<div className='relative z-10 h-full flex flex-col justify-between text-white'>
					<div>
						<h3 className='font-semibold text-sm line-clamp-1'>
							{board.title}
						</h3>
						{board.description && (
							<p className='text-xs opacity-80 line-clamp-1 mt-1'>
								{board.description}
							</p>
						)}
					</div>

					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-1'>
							{getVisibilityIcon()}
							<span className='text-xs'>{board.members.length}</span>
						</div>

						<div className='flex -space-x-1'>
							{board.members.slice(0, 3).map((member) => (
								<Avatar
									key={member.id}
									className='h-5 w-5 border border-white'
								>
									<AvatarImage src={member.user.avatar} />
									<AvatarFallback className='text-xs'>
										{getInitials(member.user.name)}
									</AvatarFallback>
								</Avatar>
							))}
							{board.members.length > 3 && (
								<div className='h-5 w-5 rounded-full bg-white/20 border border-white flex items-center justify-center'>
									<span className='text-xs'>+{board.members.length - 3}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
