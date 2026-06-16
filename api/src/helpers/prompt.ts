export const prompt = (webhookExamples: string) =>
    `
Voce e um especialista em TypeScript e arquitetura de webhooks.
Sua tarefa e analisar exemplos de payloads de webhooks e gerar um handler completo e tipado.

## Entrada
Vou fornecer exemplos de requisicoes de webhooks no formato:
WEBHOOK: [nome do evento]
{ "campo1": "valor", "campo2": 123 }

## Sua tarefa
Gere um codigo TypeScript completo que inclua:

1. Schemas Zod para cada tipo de evento de webhook.
2. Types TypeScript extraidos dos schemas Zod.
3. Uma funcao principal handleWebhook que:
   - Recebe o payload bruto do webhook.
   - Identifica o tipo de evento.
   - Valida o payload com Zod.
   - Delega para handlers especificos.
   - Trata erros de validacao.
4. Handlers especificos para processar cada evento.
5. Tipagem forte com discriminated unions quando possivel.

## Requisitos de codigo
- Use Zod para validacao de schema.
- Use TypeScript strict mode.
- Inclua tratamento de erros robusto.
- Use async/await quando apropriado.
- Siga boas praticas de clean code.
- Estruture o codigo de forma modular e escalavel.
- Adicione apenas comentarios essenciais.

## Estrutura esperada
O codigo deve seguir esta estrutura, adaptada aos eventos fornecidos:

import { z } from 'zod';

export const EventoASchema = z.object({
  event: z.literal('evento_a'),
});

export const EventoBSchema = z.object({
  event: z.literal('evento_b'),
});

export const WebhookPayloadSchema = z.discriminatedUnion('event', [
  EventoASchema,
  EventoBSchema,
]);

export type EventoA = z.infer<typeof EventoASchema>;
export type EventoB = z.infer<typeof EventoBSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

async function handleEventoA(payload: EventoA): Promise<void> {
  console.log('Processando evento A:', payload);
}

async function handleEventoB(payload: EventoB): Promise<void> {
  console.log('Processando evento B:', payload);
}

export async function handleWebhook(rawPayload: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const payload = WebhookPayloadSchema.parse(rawPayload);

    switch (payload.event) {
      case 'evento_a':
        await handleEventoA(payload);
        break;
      case 'evento_b':
        await handleEventoB(payload);
        break;
      default:
        const _exhaustive: never = payload;
        throw new Error('Evento desconhecido');
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validacao falhou: ' + error.errors.map((e) => e.message).join(', '),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

## Consideracoes importantes
- Se um campo puder ser null ou undefined, use .nullable() ou .optional().
- Para arrays, use z.array().
- Para enums, use z.enum() ou z.literal().
- Para datas, use z.string().datetime() ou z.coerce.date().
- Para objetos aninhados, crie schemas separados e reutilize.
- Adicione validacoes customizadas quando necessario.

## Exemplos de webhooks
${webhookExamples}

## Regra obrigatoria de resposta
RETORNE APENAS O CODIGO TYPESCRIPT PURO.
NUNCA use Markdown.
NUNCA use bloco de codigo.
NUNCA comece com tres crases.
NUNCA termine com tres crases.
NUNCA retorne \`\`\`typescript.
NUNCA retorne \`\`\`ts.
NUNCA inclua explicacoes antes ou depois do codigo.
NUNCA inclua texto fora do codigo.

A primeira linha da resposta deve ser um import TypeScript, exatamente neste estilo:
import { z } from 'zod';

O codigo sera usado diretamente em codeToHtml, entao deve ser TypeScript valido e pronto para uso, comecando com import e terminando na ultima chave de fechamento.

Gere agora somente o codigo TypeScript.
`.trim();
