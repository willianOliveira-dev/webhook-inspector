import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface CheckboxProps extends RadixCheckbox.CheckboxProps {}

export function Checkbox(props: CheckboxProps) {
    return (
        <RadixCheckbox.Root
            {...props}
            className={twMerge(
                // BACKGROUND e BORDA do Checkbox (Estado Desmarcado)
                'flex size-4 shrink-0 items-center justify-center rounded border border-white-400 bg-white-50 transition-colors hover:border-white-600',
                // FOCO
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-500 focus-visible:ring-offset-2',
                // ESTADO MARCADO
                'data-[state=checked]:bg-fuchsia-400 data-[state=checked]:border-fuchsia-400'
            )}
        >
            <RadixCheckbox.Indicator className="flex items-center justify-center text-white-50">
                <CheckIcon className="size-3" strokeWidth={3} />
            </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
    );
}
