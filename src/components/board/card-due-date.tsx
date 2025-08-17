'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { cardsApi } from '@/services/cards.service';
import { formatDateTime } from '@/utils/formatDate';
import { Card } from '@/types';

const dueDateSchema = z.object({
    dueDate: z.string().min(1, 'Selecione uma data'),
    dueTime: z.string().optional(),
});

type DueDateForm = z.infer<typeof dueDateSchema>;

interface CardDueDateModalProps {
    card: Card;
    open: boolean;
    onClose: () => void;
}

export function CardDueDateModal({ card, open, onClose }: CardDueDateModalProps) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<DueDateForm>({
        resolver: zodResolver(dueDateSchema),
        defaultValues: {
            dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
            dueTime: card.dueDate ? new Date(card.dueDate).toTimeString().slice(0, 5) : '',
        },
    });

    const watchedDate = watch('dueDate');
    const watchedTime = watch('dueTime');

    const updateDueDateMutation = useMutation({
        mutationFn: (data: { dueDate?: string }) =>
            cardsApi.update(card.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] });
            toast.success('Data de vencimento atualizada');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar data');
        },
    });

    const removeDueDateMutation = useMutation({
        mutationFn: () =>
            cardsApi.update(card.id, { dueDate: undefined }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] });
            toast.success('Data de vencimento removida');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao remover data');
        },
    });

    const onSubmit = (data: DueDateForm) => {
        const { dueDate, dueTime } = data;

        const combinedDateTime = dueTime
            ? `${dueDate}T${dueTime}:00.000Z`
            : `${dueDate}T23:59:59.999Z`;

        updateDueDateMutation.mutate({
            dueDate: combinedDateTime,
        });
    };

    const handleRemoveDueDate = () => {
        removeDueDateMutation.mutate();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const quickDateOptions = [
        {
            label: 'Hoje',
            getValue: () => new Date().toISOString().split('T')[0],
        },
        {
            label: 'Amanhã',
            getValue: () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
            },
        },
        {
            label: 'Próxima semana',
            getValue: () => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return nextWeek.toISOString().split('T')[0];
            },
        },
    ];

    const previewDateTime = watchedDate && watchedTime
        ? formatDateTime(`${watchedDate}T${watchedTime}:00.000Z`)
        : watchedDate
            ? formatDateTime(`${watchedDate}T23:59:59.999Z`)
            : null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Data de vencimento</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Data atual (se existir) */}
                    {card.dueDate && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        Data atual
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        {formatDateTime(card.dueDate)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveDueDate}
                                    disabled={removeDueDateMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Sugestões rápidas */}
                    <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">
                            Sugestões rápidas
                        </label>
                        <div className="flex space-x-2">
                            {quickDateOptions.map((option) => (
                                <Button
                                    key={option.label}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setValue('dueDate', option.getValue())}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Seleção de data */}
                    <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">
                            Data
                        </label>
                        <Input
                            type="date"
                            {...register('dueDate')}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.dueDate && (
                            <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>
                        )}
                    </div>

                    {/* Seleção de hora (opcional) */}
                    <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Hora (opcional)</span>
                        </label>
                        <Input
                            type="time"
                            {...register('dueTime')}
                            placeholder="--:--"
                        />
                    </div>

                    {/* Preview */}
                    {previewDateTime && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">Preview:</p>
                            <p className="text-sm text-gray-700">{previewDateTime}</p>
                        </div>
                    )}

                    <div className="flex space-x-2 pt-4">
                        <Button
                            type="submit"
                            disabled={updateDueDateMutation.isPending}
                            className="flex-1"
                        >
                            {updateDueDateMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={updateDueDateMutation.isPending}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}