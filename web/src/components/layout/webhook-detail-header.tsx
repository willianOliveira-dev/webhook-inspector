import { z } from 'zod';
import { Badge } from '../ui/badge';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { webhookDetailsSchema } from '../../http/schemas/webhooks';

interface WebhookDetailHeaderProps {
    webhookDetailHeader: Pick<
        z.infer<typeof webhookDetailsSchema>,
        'method' | 'pathname' | 'ip' | 'createdAt'
    >;
}

export function WebHookDetailHeader({
    webhookDetailHeader,
}: WebhookDetailHeaderProps) {
    return (
        <header className="space-y-4 border-b border-white-300 px-6 py-5">
            <div className="flex items-center gap-3">
                <Badge>{webhookDetailHeader.method}</Badge>

                <span className="text-lg font-medium text-white-900">
                    {webhookDetailHeader.pathname}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-white-600">
                    <span>From IP</span>
                    <span className="font-mono underline underline-offset-4">
                        {webhookDetailHeader.ip}
                    </span>
                </div>

                <span className="w-px h-4 bg-white-300" />

                <div className="flex items-center gap-2 text-sm text-white-600">
                    <span>
                        {formatDate(
                            webhookDetailHeader.createdAt,
                            'dd/MM/yyyy, HH:mm:ss',
                            { locale: ptBR }
                        )}
                    </span>
                </div>
            </div>
        </header>
    );
}
