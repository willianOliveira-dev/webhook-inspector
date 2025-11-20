import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { WebhookListItem } from './webhook-list-item';
import { webhookListSchema } from '../../http/schemas/webhooks';
import { Loader2, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { CodeBlock } from './code-block';

export function WebhookList() {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver>(null);

    const [checkedWebhookIds, setCheckedWebhookIds] = useState<string[]>([]);
    const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
        string | null
    >(null);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useSuspenseInfiniteQuery({
            queryKey: ['webhooks'],
            queryFn: async ({ pageParam }) => {
                const url = new URL('http://localhost:3333/api/v1/webhooks');

                if (pageParam) {
                    url.searchParams.set('cursor', pageParam);
                }
                const response = await fetch(url);
                const data = await response.json();

                return webhookListSchema.parse(data);
            },
            getNextPageParam: (lastPage) => {
                return lastPage.nextCursor ?? undefined;
            },
            initialPageParam: undefined as string | undefined,
        });

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            {
                threshold: 0.1,
            }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    const handleCheckedWebhook = (webhookId: string) => {
        if (checkedWebhookIds.includes(webhookId)) {
            setCheckedWebhookIds((prev) =>
                prev.filter((id) => id !== webhookId)
            );
        } else {
            setCheckedWebhookIds((prev) => [...prev, webhookId]);
        }
    };

    const handleGenerateHandler = async () => {
        setGeneratedHandlerCode(null);

        const response = fetch('http://localhost:3333/api/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ webhookIds: checkedWebhookIds }),
        });

        type GenerateReponse = {
            code: string;
        };

        toast.promise(response, {
            loading: 'Estamos gerando seu código...',
            success: async (data) => {
                const d: GenerateReponse = await data.json();
                setGeneratedHandlerCode(d.code);
                return `Código pronto`;
            },
            error: 'Error ao gerar código',
        });
    };

    const hasAnyWebhookChecked = checkedWebhookIds.length > 0;

    const webhooks = data.pages.flatMap(({ webhooks }) => webhooks);

    return (
        <>
            <div className="flex-1 overflow-y-auto">
                <button
                    onClick={handleGenerateHandler}
                    disabled={!hasAnyWebhookChecked}
                    className={twMerge(
                        'text-sm',
                        'flex justify-center items-center gap-2 my-2 px-2 py-1.5 w-full',
                        'bg-linear-to-tr from-fuchsia-500  via-fuchsia-400 to-fuchsia-500  text-white',
                        'hover:from-fuchsia-400  hover:via-fuchsia-400 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors duration-500 cursor-pointer rounded-sm '
                    )}
                >
                    <Wand2 className="size-4" />
                    <span>Gerar handler</span>
                </button>
                <div className="space-y-1 p-2">
                    {webhooks.map((webhook) => (
                        <WebhookListItem
                            key={webhook.id}
                            webhook={webhook}
                            onWebhookChecked={handleCheckedWebhook}
                            isWebhookChecked={checkedWebhookIds.includes(
                                webhook.id
                            )}
                        />
                    ))}

                    {hasNextPage && (
                        <div className="p-2" ref={loadMoreRef}>
                            {isFetchingNextPage && (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="size-5 animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {!!generatedHandlerCode && (
                <Dialog.Root defaultOpen>
                    <Dialog.Overlay className="bg-white-600/50 fixed inset-0 z-10" />
                    <Dialog.Content className="flex items-center justify-center fixed left-1/2 right-1/2 top-1/2 max-h-[85vh] w-[95vw] -translate-x-1/2 -translate-y-1/2 max-w-[500px] z-20">
                        <div className="bg/white min-w-fit overflow-y-auto max-h-[600px] rounded-md border border-white-400">
                            <CodeBlock
                                language="typescript"
                                code={generatedHandlerCode}
                            ></CodeBlock>
                        </div>
                    </Dialog.Content>
                </Dialog.Root>
            )}
        </>
    );
}
