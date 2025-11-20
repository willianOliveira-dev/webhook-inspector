import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
interface BadgeProps extends ComponentProps<'span'> {}

export function Badge({ className, ...props }: BadgeProps) {
    return (
        <span
            {...props}
            className={twMerge(
                'px-3 py-1 rounded-lg border font-mono text-sm font-semibold border-white-300 bg-white-100 text-white-700',
                className
            )}
        />
    );
}
