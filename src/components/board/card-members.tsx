'use client';

import { useState } from 'react';
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
import { Search, UserPlus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cardsApi } from '@/services/cards.service';
import { usersApi } from '@/services/users.service';
import { getInitials } from '@/utils/getInitials';
import { Card, User } from '@/types';

interface CardMembersModalProps {
    card: Card;
    open: boolean;
    onClose: () => void;
}

export function CardMembersModal({ card, open, onClose }: CardMembersModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: users = [], isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users', searchTerm],
        queryFn: () =>
            usersApi.search(searchTerm).then((res) => res.data),
        enabled: open && searchTerm.length > 1,
    });

    const existingMemberIds = card.members?.map(member => member.user.id) || [];
    const availableUsers = users.filter(user => !existingMemberIds.includes(user.id));

    const addMemberMutation = useMutation({
        mutationFn: (userId: string) =>
            cardsApi.assignMember(card.id, { userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] });
            toast.success('Membro adicionado ao card');
            setSearchTerm('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao adicionar membro');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: string) =>
            cardsApi.unassignMember(card.id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] });
            toast.success('Membro removido do card');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao remover membro');
        },
    });

    const handleAddMember = (user: User) => {
        addMemberMutation.mutate(user.id);
    };

    const handleRemoveMember = (userId: string) => {
        removeMemberMutation.mutate(userId);
    };

    const handleClose = () => {
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Membros do card</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    {card.members && card.members.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Membros atuais
                            </h3>
                            <div className="space-y-2">
                                {card.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user.avatar} />
                                                <AvatarFallback>
                                                    {getInitials(member.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{member.user.name}</p>
                                                <p className="text-xs text-gray-500">@{member.user.username}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.user.id)}
                                            disabled={removeMemberMutation.isPending}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Adicionar membro
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Pesquisar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />

                            {searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                    {isLoadingUsers ? (
                                        <div className="p-3 text-center text-sm text-gray-500">
                                            Buscando usuários...
                                        </div>
                                    ) : availableUsers.length > 0 ? (
                                        availableUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => handleAddMember(user)}
                                                disabled={addMemberMutation.isPending}
                                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left disabled:opacity-50"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <Check className="h-4 w-4 text-green-600" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-sm text-gray-500">
                                            {searchTerm.length < 2
                                                ? 'Digite pelo menos 2 caracteres'
                                                : 'Nenhum usuário encontrado'
                                            }
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={handleClose}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}