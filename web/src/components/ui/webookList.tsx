import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { WebhookListItem } from './webhook-list-item';
import { webhookListSchema } from '../../http/schemas/webhooks';
import { Check, Copy, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { CodeBlock } from './code-block';

function removeMarkdownCodeFence(code: string) {
    const trimmedCode = code.trim();
    const fencedCodeMatch = trimmedCode.match(
        /^```(?:typescript|ts)?\s*([\s\S]*?)\s*```$/i
    );

    if (fencedCodeMatch) {
        return fencedCodeMatch[1].trim();
    }

    return trimmedCode
        .replace(/^```(?:typescript|ts)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

export function WebhookList() {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver>(null);

    const [checkedWebhookIds, setCheckedWebhookIds] = useState<string[]>([]);
    const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
        string | null
    >(null);
    const [hasCopiedCode, setHasCopiedCode] = useState(false);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useSuspenseInfiniteQuery({
            queryKey: ['webhooks'],
            queryFn: async ({ pageParam }) => {
                const url = new URL('/api/v1/webhooks', window.location.origin);

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
        setHasCopiedCode(false);

        const response = fetch('/api/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ webhookIds: checkedWebhookIds }),
        }).then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || 'Nao foi possivel gerar o codigo'
                );
            }

            return data;
        });

        type GenerateReponse = {
            code: string;
        };

        toast.promise(response, {
            loading: 'Estamos gerando seu código...',
            success: (data: GenerateReponse) => {
                setGeneratedHandlerCode(removeMarkdownCodeFence(data.code));
                return `Código pronto`;
            },
            error: 'Error ao gerar código',
        });
    };

    const handleCopyGeneratedCode = async () => {
        if (!generatedHandlerCode) {
            return;
        }

        await navigator.clipboard.writeText(generatedHandlerCode);
        setHasCopiedCode(true);

        window.setTimeout(() => {
            setHasCopiedCode(false);
        }, 2000);
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
                <Dialog.Root
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setGeneratedHandlerCode(null);
                        }
                    }}
                >
                    <Dialog.Overlay className="fixed inset-0 z-10 bg-white-900/30 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-20 flex max-h-[90vh] w-[min(1100px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white-300 bg-white-50 shadow-2xl shadow-white-900/20">
                        <div className="border-b border-white-300 bg-white-100 px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div>
                                        <Dialog.Title className="text-base font-semibold text-white-900">
                                            Handler gerado
                                        </Dialog.Title>
                                        <Dialog.Description className="mt-1 text-sm text-white-600">
                                            Codigo TypeScript pronto para copiar e adaptar ao seu webhook.
                                        </Dialog.Description>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCopyGeneratedCode}
                                        className="inline-flex items-center gap-2 rounded-lg border border-white-300 bg-white-50 px-3 py-2 text-sm font-medium text-white-800 transition-colors hover:bg-white-200"
                                    >
                                        {hasCopiedCode ? (
                                            <Check className="size-4 text-emerald-600" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                        {hasCopiedCode ? 'Copiado' : 'Copiar'}
                                    </button>

                                    <Dialog.Close className="inline-flex size-9 items-center justify-center rounded-lg border border-white-300 bg-white-50 text-white-700 transition-colors hover:bg-white-200 hover:text-white-900">
                                        <X className="size-4" />
                                    </Dialog.Close>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 bg-white-50 p-4">
                            <CodeBlock
                                language="typescript"
                                code={generatedHandlerCode}
                                className="h-full max-h-[68vh] rounded-xl border-white-300 bg-white [&_code]:bg-white! [&_pre]:min-h-full [&_pre]:bg-white! [&_pre]:p-5 [&_pre]:text-[13px] [&_pre]:leading-6"
                            />
                        </div>
                    </Dialog.Content>
                </Dialog.Root>
            )}
        </>
    );
}
