import { useEffect, useState, type ComponentProps } from 'react';
import { codeToHtml } from 'shiki';
import { twMerge } from 'tailwind-merge';

interface CodeBlockProps extends ComponentProps<'div'> {
    code: string;
    language?: string;
}

export function CodeBlock({
    className,
    code,
    language = 'json',
    ...props
}: CodeBlockProps) {
    const [parsedCode, setParsedCode] = useState<string>('');

    useEffect(() => {
        if (code) {
            codeToHtml(code, {
                lang: language,
                theme: 'vitesse-light',
            }).then((parsed) => setParsedCode(parsed));
        }
    }, [code, language]);

    return (
        <div
            {...props}
            className={twMerge(
                'relative rounded-lg border border-white-300 overflow-auto-x',
                className
            )}
        >
            <div
                // Aqui o Shiki irá injetar o HTML.
                // Acessar tag "pre" que não temos acesso.
                className="[&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parsedCode }}
            ></div>
        </div>
    );
}
