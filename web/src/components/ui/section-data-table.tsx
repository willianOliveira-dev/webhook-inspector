import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

interface SectionDataTableProps extends ComponentProps<'div'> {
    data: Array<{ key: string; value: string }>;
}

export function SectionDataTable({
    className,
    data,
    ...props
}: SectionDataTableProps) {
    return (
        <div
            {...props}
            className={twMerge(
                'overflow-hidden rounded-lg border border-white-300',
                className
            )}
        >
            <table className="w-full">
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={item.key}
                            className="border-b border-white-300 last:border-0"
                        >
                            <td className="p-3 text-sm font-medium text-white-600 bg-white-100 border-r border-white-300">
                                {item.key}
                            </td>
                            <td className="p-3 text-sm font-mono text-white-800">
                                {item.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
