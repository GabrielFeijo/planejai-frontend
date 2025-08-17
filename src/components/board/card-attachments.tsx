'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Paperclip,
    Upload,
    File,
    Download,
    Trash2,
    Image as ImageIcon,
    FileText,
    Video,
    Music,
    Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { cardsApi } from '@/services/cards.service';
import { formatDateTime } from '@/utils/formatDate';
import { Card, Attachment } from '@/types';

interface CardAttachmentsModalProps {
    card: Card;
    open: boolean;
    onClose: () => void;
}

const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return ImageIcon;
    if (mimetype.startsWith('video/')) return Video;
    if (mimetype.startsWith('audio/')) return Music;
    if (mimetype.includes('pdf') || mimetype.includes('document')) return FileText;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return Archive;
    return File;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function CardAttachmentsModal({ card, open, onClose }: CardAttachmentsModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const uploadAttachmentMutation = useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return cardsApi.uploadAttachment(card.id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] });
            toast.success('Arquivo anexado com sucesso');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao anexar arquivo');
        },
    });

    const deleteAttachmentMutation = useMutation({
        mutationFn: (attachmentId: string) =>
            cardsApi.deleteAttachment(card.id, attachmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['card', card.id] });
            toast.success('Arquivo removido');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao remover arquivo');
        },
    });

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`);
                return;
            }

            uploadAttachmentMutation.mutate(file);
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDownload = async (attachment: Attachment) => {
        try {
            const response = await cardsApi.downloadAttachment(card.id, attachment.id);

            const blob = response.data;

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.filename || 'download';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success('Arquivo baixado com sucesso');
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
        }
    };


    const handleDelete = (attachment: Attachment) => {
        if (confirm(`Remover arquivo ${attachment.filename}?`)) {
            deleteAttachmentMutation.mutate(attachment.id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Paperclip className="h-5 w-5" />
                        <span>Anexos ({card.attachments?.length || 0})</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                            Arraste arquivos aqui ou{' '}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-700 underline"
                            >
                                clique para selecionar
                            </button>
                        </p>
                        <p className="text-xs text-gray-400">
                            Máximo 5MB por arquivo
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files)}
                        />
                    </div>

                    {uploadAttachmentMutation.isPending && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">Enviando arquivo...</p>
                        </div>
                    )}

                    {card.attachments && card.attachments.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-900">
                                Arquivos anexados
                            </h3>
                            {card.attachments.map((attachment) => {
                                const FileIcon = getFileIcon(attachment.mimetype);
                                return (
                                    <div
                                        key={attachment.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <FileIcon className="h-8 w-8 text-gray-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {attachment.filename}
                                                </p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span>{formatFileSize(attachment.size)}</span>
                                                    <span>•</span>
                                                    <span>{formatDateTime(attachment.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(attachment)}
                                                title="Baixar arquivo"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(attachment)}
                                                disabled={deleteAttachmentMutation.isPending}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Remover arquivo"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum arquivo anexado</p>
                            <p className="text-sm">Adicione arquivos para compartilhar com a equipe</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}