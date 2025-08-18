'use client';

import { Dispatch, SetStateAction } from 'react';
import { Board } from '@/types';
import { BoardCard } from './board-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BoardGridProps {
	boards: Board[];
	setIsCreateBoardModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function BoardGrid({
	boards,
	setIsCreateBoardModalOpen,
}: BoardGridProps) {
	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
				{boards.length > 0 && <button
					onClick={() => setIsCreateBoardModalOpen(true)}
					className='h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:border-gray-400 transition-colors group'
				>
					<div className='text-center'>
						<Plus className='h-6 w-6 text-gray-400 group-hover:text-gray-600 mx-auto mb-1' />
						<span className='text-sm text-gray-600 group-hover:text-gray-800'>
							Criar novo quadro
						</span>
					</div>
				</button>}

				{boards.map((board) => (
					<BoardCard
						key={board.id}
						board={board}
					/>
				))}
			</div>

			{boards.length === 0 && (
				<div className='text-center py-12'>
					<div className='bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
						<Plus className='h-8 w-8 text-gray-400' />
					</div>
					<h3 className='text-lg font-medium text-gray-900 mb-2'>
						Nenhum quadro ainda
					</h3>
					<p className='text-gray-500 mb-4'>
						Crie seu primeiro quadro para começar a organizar suas tarefas
					</p>
					<Button onClick={() => setIsCreateBoardModalOpen(true)}>
						<Plus className='mr-2 h-4 w-4' />
						Criar quadro
					</Button>
				</div>
			)}
		</div>
	);
}
