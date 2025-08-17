'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { BoardGrid } from '@/components/dashboard/board-grid';
import { CreateBoardModal } from '@/components/dashboard/create-board-modal';
import { Loader2 } from 'lucide-react';
import { boardsApi } from '@/services/boards.service';

export default function DashboardPage() {
	const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
	const { isAuthenticated, user } = useAuthStore();
	const router = useRouter();

	const {
		data: boards,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['boards'],
		queryFn: () => boardsApi.getAll().then((res) => res.data),
		enabled: isAuthenticated,
	});

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/auth/login');
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated || !user) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<DashboardHeader />
				<main className='container mx-auto px-4 py-8'>
					<div className='flex items-center justify-center py-12'>
						<Loader2 className='h-8 w-8 animate-spin' />
					</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gray-50'>
				<DashboardHeader />
				<main className='container mx-auto px-4 py-8'>
					<div className='text-center py-12'>
						<p className='text-red-500'>Erro ao carregar quadros</p>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<DashboardHeader />
			<main className='container mx-auto px-4 py-8'>
				<div className='mb-8'>
					<h1 className='text-2xl font-bold text-gray-900 mb-2'>
						Olá, {user.name}! 👋
					</h1>
					<p className='text-gray-600'>Aqui estão seus quadros de projeto</p>
				</div>

				<BoardGrid
					boards={boards || []}
					setIsCreateBoardModalOpen={setIsCreateBoardModalOpen}
				/>
				<CreateBoardModal
					isOpen={isCreateBoardModalOpen}
					setIsOpen={setIsCreateBoardModalOpen}
				/>
			</main>
		</div>
	);
}
