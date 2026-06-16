import { useEffect, useState, type ComponentProps } from 'react';
import { codeToHtml } from 'shiki';
import { twMerge } from 'tailwind-merge';

interface CodeBlockProps extends ComponentProps<'div'> {
    code: string;
    language?: string;
    theme?: string;
}

export function CodeBlock({
    className,
    code,
    language = 'json',
    theme = 'vitesse-light',
    ...props
}: CodeBlockProps) {
    const [parsedCode, setParsedCode] = useState<string>('');

    useEffect(() => {
        if (code) {
            codeToHtml(code, {
                lang: language,
                theme,
            }).then((parsed) => {
                const parsedWithoutInlineBackground = parsed
                    .replace(/background-color:[^;"']+;?/gi, '')
                    .replace(/background:[^;"']+;?/gi, '');

                setParsedCode(parsedWithoutInlineBackground);
            });
        }
    }, [code, language, theme]);

    return (
        <div
            {...props}
            className={twMerge(
                'relative rounded-lg border border-white-300 overflow-auto',
                className
            )}
        >
            <div
                // Aqui o Shiki irá injetar o HTML.
                // Acessar tag "pre" que não temos acesso.
                className="[&_pre]:bg-white! [&_code]:bg-white! [&_pre]:p-4 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parsedCode }}
            ></div>
        </div>
    );
}
