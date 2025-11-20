import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

interface SectionTitleProps extends ComponentProps<'h3'> {}

export function SectionTitle({ className, ...props }: SectionTitleProps) {
    return (
        <h3
            {...props}
            className={twMerge(
                'text-sm font-semibold text-white-700',
                className
            )}
        />
    );
}
