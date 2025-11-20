export const prompt = (webhookExamples: string) =>
    `
Você é um especialista em TypeScript e arquitetura de webhooks. Sua tarefa é analisar exemplos de payloads de webhooks e gerar um handler completo e tipado.

## Entrada
Vou fornecer exemplos de requisições de webhooks no formato:
WEBHOOK: [nome do evento]
{ "campo1": "valor", "campo2": 123 }

## Sua Tarefa
Gere um código TypeScript completo que inclua:

1. **Schemas Zod**: Crie schemas de validação para cada tipo de evento de webhook
2. **Types TypeScript**: Extraia os tipos a partir dos schemas Zod
3. **Função Handler**: Crie uma função principal que:
   - Recebe o payload do webhook
   - Identifica o tipo de evento
   - Valida o payload com Zod
   - Delega para handlers específicos de cada evento
   - Trata erros de validação adequadamente
4. **Handlers Específicos**: Crie funções separadas para processar cada tipo de evento
5. **Tipagem Forte**: Use tipos discriminados (discriminated unions) para garantir type-safety

## Requisitos de Código
- Use Zod para validação de schema
- Use TypeScript strict mode
- Inclua tratamento de erros robusto
- Use async/await quando apropriado
- Siga boas práticas de clean code
- Estruture o código de forma modular e escalável
- Adicione apenas comentários essenciais (evite poluição visual excessiva)

## Estrutura Esperada do Código

O código deve seguir esta estrutura (adaptada aos eventos fornecidos):

import { z } from 'zod';

export const EventoASchema = z.object({
  event: z.literal('evento_a'),
  // campos específicos
});

export const EventoBSchema = z.object({
  event: z.literal('evento_b'),
  // campos específicos
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
  // Lógica específica
}

async function handleEventoB(payload: EventoB): Promise<void> {
  console.log('Processando evento B:', payload);
  // Lógica específica
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
        error: 'Validação falhou: ' + error.errors.map(e => e.message).join(', ')
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

## Considerações Importantes
- Se um campo puder ser null ou undefined, use .nullable() ou .optional()
- Para arrays, use z.array()
- Para enums, use z.enum() ou z.literal()
- Para datas, use z.string().datetime() ou z.coerce.date()
- Para objetos aninhados, crie schemas separados e reutilize
- Adicione validações customizadas quando necessário (.email(), .url(), .min(), .max())

## Exemplos de Webhooks
${webhookExamples}

## IMPORTANTE - Formato de Resposta
RETORNE APENAS O CÓDIGO TYPESCRIPT PURO, SEM:
- Blocos de código markdown (\`\`\`typescript ou \`\`\`)
- Explicações antes ou depois do código
- Texto adicional ou comentários fora do código
- Qualquer formatação markdown

O código será usado diretamente em um processador (codeToHtml), portanto deve ser TypeScript válido e pronto para uso, começando com "import" e terminando com a última chave de fechamento.

Gere agora o código TypeScript completo.
`.trim();
