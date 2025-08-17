'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SquareKanban, LogOut, User, Settings } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/getInitials';

export function DashboardHeader() {
	const { user, logout } = useAuthStore();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push('/');
	};

	return (
		<header className='bg-white border-b border-gray-200 sticky top-0 z-40'>
			<div className='container mx-auto px-4'>
				<div className='flex items-center justify-between h-16'>
					<div className='flex items-center space-x-4'>
						<div className='flex items-center space-x-2'>
							<SquareKanban className='h-8 w-8 text-blue-600' />
							<span className='text-xl font-bold text-gray-900'>PlanejAí</span>
						</div>
					</div>

					<div className='flex items-center space-x-4'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='relative h-10 w-10 rounded-full'
								>
									<Avatar className='h-10 w-10'>
										<AvatarImage
											src={user?.avatar}
											alt={user?.name}
										/>
										<AvatarFallback className='bg-blue-600 text-white'>
											{user?.name ? getInitials(user.name) : 'N/A'}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-56'
								align='end'
							>
								<div className='flex items-center justify-start gap-2 p-2'>
									<div className='flex flex-col space-y-1 leading-none'>
										<p className='font-medium text-sm'>{user?.name}</p>
										<p className='text-xs text-muted-foreground'>
											{user?.email}
										</p>
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<User className='mr-2 h-4 w-4' />
									Perfil
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className='mr-2 h-4 w-4' />
									Configurações
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									<LogOut className='mr-2 h-4 w-4' />
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</header>
	);
}
