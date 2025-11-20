import { Link } from '@tanstack/react-router';
import { IconButton } from './icon-button';
import { Trash2Icon } from 'lucide-react';
import { Checkbox } from './checkbox';
import { formatDistanceToNow } from 'date-fns';
import { z } from 'zod';
import { ptBR } from 'date-fns/locale';
import { webookListItemSchema } from '../../http/schemas/webhooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type WebhookListItemProps = {
    webhook: z.infer<typeof webookListItemSchema>;
    onWebhookChecked: (webhookId: string) => void;
    isWebhookChecked: boolean;
};

export function WebhookListItem({
    webhook,
    onWebhookChecked,
    isWebhookChecked,
}: WebhookListItemProps) {
    // to DELETE or CREATE
    const queryClient = useQueryClient();

    const { mutate: deleteWebhook } = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`http://localhost:3333/api/v1/webhooks/${id}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            toast.success('Webhook deletado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
        },
    });

    return (
        <div className="group rounded-lg transition-colors duration-150 hover:bg-white-200">
            <div className="flex items-start gap-3 px-4 py-2.5">
                <Checkbox
                    onCheckedChange={() => onWebhookChecked(webhook.id)}
                    checked={isWebhookChecked}
                />

                <Link
                    to="/webhooks/$id"
                    params={{ id: webhook.id }}
                    className="flex flex-1 min-w-0 items-start gap-3"
                >
                    <span className="w-12 shrink-0 font-mono text-xs font-semibold text-white-700 text-right">
                        {webhook.method}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-xs text-white-900 leading-tight font-mono">
                            {webhook.pathname}
                        </p>

                        <p className="text-xs text-white-600 font-medium mt-1">
                            {formatDistanceToNow(webhook.createdAt, {
                                locale: ptBR,
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                </Link>
                <IconButton
                    onClick={() => deleteWebhook(webhook.id)}
                    icon={<Trash2Icon className="size-3.5 text-white-500" />}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                />
            </div>
        </div>
    );
}
