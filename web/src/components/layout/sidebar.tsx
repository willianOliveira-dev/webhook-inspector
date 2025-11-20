import { CopyIcon } from 'lucide-react';
import { IconButton } from '../ui/icon-button';
import { WebhookList } from '../ui/webookList';
import { Suspense } from 'react';

export function Sidebar() {
    return (
        <aside className="flex h-screen flex-col bg-white-100">
            <div className="flex items-center justify-between border-b border-white-300 px-4 py-5">
                <div className="flex items-baseline">
                    <span className="font-semibold text-white-900">
                        webhook
                    </span>
                    <span className="font-normal text-white-600">.inspect</span>
                </div>
            </div>

            <div className="flex items-center gap-2 border-b border-white-300 bg-white-200 px-4 py-2.5">
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1 text-xs font-mono text-white-700">
                    <span className="truncate">
                        http://localhost:3333/api/capture
                    </span>

                    <IconButton
                        icon={<CopyIcon className="size-4 text-white-700" />}
                    />
                </div>
            </div>

            <Suspense fallback={<p>Carregando...</p>}>
                <WebhookList />
            </Suspense>
        </aside>
    );
}
