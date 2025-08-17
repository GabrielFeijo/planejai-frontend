'use client';

import { useState } from 'react';
import { List } from '@/types';
import { ListComponent } from './list-component';
import { CreateListForm } from './create-list-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BoardListsProps {
	lists: List[];
}

export function BoardLists({ lists }: BoardListsProps) {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const sortedLists = [...lists].sort((a, b) => a.position - b.position);

	return (
		<div className='p-4'>
			<div className='flex space-x-4 overflow-x-auto pb-4'>
				{sortedLists.map((list) => (
					<ListComponent
						key={list.id}
						list={list}
					/>
				))}

				<div className='flex-shrink-0'>
					{showCreateForm ? (
						<CreateListForm onCancel={() => setShowCreateForm(false)} />
					) : (
						<Button
							variant='ghost'
							onClick={() => setShowCreateForm(true)}
							className='w-72 h-fit bg-white/10 hover:bg-white/20 text-white border-none justify-start p-3'
						>
							<Plus className='h-4 w-4 mr-2' />
							Adicionar uma lista
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
