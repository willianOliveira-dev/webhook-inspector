import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="h-full flex justify-center items-center p-2">
            <div className="flex flex-col gap-2 text-center p-8">
                <h3 className="text-md font-semibold">
                    Nenhum webhook selecionado
                </h3>
                <p className="text-sm max-w-md">
                    Selecione um webhook da lista para visualizar detalhes
                </p>
            </div>
        </div>
    );
}
