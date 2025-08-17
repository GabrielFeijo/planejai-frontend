'use client';

import { useState } from 'react';
import { Card } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { CardModal } from './card-modal';
import { formatDate } from '@/utils/formatDate';
import { getInitials } from '@/utils/getInitials';
import { getPriorityColor, getPriorityText } from '@/utils/getPriority';
import { isOverdue } from '@/utils/isOverdue';

interface CardComponentProps {
	card: Card;
}

export function CardComponent({ card }: CardComponentProps) {
	const [showModal, setShowModal] = useState(false);

	const hasAttachments =
		card._count?.attachments && card._count.attachments > 0;
	const hasComments = card._count?.comments && card._count.comments > 0;
	const hasDueDate = !!card.dueDate;
	const hasMembers = card.members.length > 0;

	return (
		<>
			<div
				onClick={() => setShowModal(true)}
				className='bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group'
			>
				{card.priority !== 'NONE' && (
					<Badge className={`mb-2 text-xs ${getPriorityColor(card.priority)}`}>
						{getPriorityText(card.priority)}
					</Badge>
				)}

				<h4 className='text-sm font-medium text-gray-900 mb-2 line-clamp-3'>
					{card.title}
				</h4>

				{card.labels.length > 0 && (
					<div className='flex flex-wrap gap-1 mb-2'>
						{card.labels.map((label) => (
							<div
								key={label.id}
								className='px-2 py-1 rounded text-xs text-white'
								style={{ backgroundColor: label.color }}
							>
								{label.name}
							</div>
						))}
					</div>
				)}

				<div className='flex items-center justify-between mt-3'>
					<div className='flex items-center space-x-2 text-gray-500'>
						{hasDueDate && (
							<div
								className={`flex items-center space-x-1 text-xs ${isOverdue(card.dueDate) ? 'text-red-600' : 'text-gray-500'
									}`}
							>
								<Calendar className='h-3 w-3' />
								<span>{formatDate(card.dueDate!)}</span>
							</div>
						)}

						{!!hasComments && (
							<div className='flex items-center space-x-1 text-xs'>
								<MessageSquare className='h-3 w-3' />
								<span>{card._count!.comments}</span>
							</div>
						)}

						{!!hasAttachments && (
							<div className='flex items-center space-x-1 text-xs'>
								<Paperclip className='h-3 w-3' />
								<span>{card._count!.attachments}</span>
							</div>
						)}
					</div>

					{hasMembers && (
						<div className='flex -space-x-1'>
							{card.members.slice(0, 3).map((member) => (
								<Avatar
									key={member.id}
									className='h-6 w-6 border border-white'
								>
									<AvatarImage src={member.user.avatar} />
									<AvatarFallback className='text-xs bg-gray-500 text-white'>
										{getInitials(member.user.name)}
									</AvatarFallback>
								</Avatar>
							))}
							{card.members.length > 3 && (
								<div className='h-6 w-6 rounded-full bg-gray-200 border border-white flex items-center justify-center'>
									<span className='text-xs text-gray-600'>
										+{card.members.length - 3}
									</span>
								</div>
							)}
						</div>
					)}
				</div>

				{card.isCompleted && (
					<div className='mt-2 text-xs text-green-600 font-medium'>
						✓ Concluído
					</div>
				)}
			</div>

			<CardModal
				card={card}
				open={showModal}
				onClose={() => setShowModal(false)}
			/>
		</>
	);
}
