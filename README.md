# webhook.inspect

Um painel simples para capturar webhooks, entender o que chegou e gerar um handler TypeScript a partir de payloads reais.

O `webhook.inspect` nasceu para aqueles momentos em que você está integrando Stripe, GitHub, Mercado Pago, Shopify ou qualquer outro serviço que envia webhooks, mas ainda não sabe exatamente como o payload chega na prática. Em vez de ficar procurando log ou montando endpoint temporário, você aponta o provedor para uma URL de captura, vê as chamadas chegando na tela e usa exemplos reais para gerar um handler tipado com Zod.

## O que o app faz

* Captura qualquer método HTTP enviado para `/capture/*`.
* Salva método, caminho, IP, headers, body, tamanho, content-type e data de criação.
* Lista os webhooks recebidos em uma interface limpa.
* Permite abrir cada webhook para inspecionar os detalhes da requisição.
* Gera um handler TypeScript com Zod usando exemplos selecionados.
* Serve o frontend buildado pela própria API, facilitando o deploy em um único serviço no Render.

> [!NOTE]
> O código gerado pela IA é um ponto de partida. Antes de usar em produção, revise regras de negócio, idempotência, retries, autenticação e validação de assinatura do provedor.

## Stack

| Parte | Tecnologia |
| --- | --- |
| API | Fastify 5, Zod, Prisma |
| Web | React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS |
| Banco | PostgreSQL |
| IA | Groq via Vercel AI SDK |
| Deploy | Docker multi-stage pronto para Render |
| Monorepo | pnpm workspaces |

## Estrutura do projeto

```txt
.
|-- api/                 # API Fastify, Prisma e rotas
|   |-- prisma/          # schema.prisma e migrations
|   `-- src/
|-- web/                 # Frontend React/Vite
|-- Dockerfile           # Imagem única para API + frontend
|-- pnpm-workspace.yaml
`-- package.json

```

## Requisitos

* Node.js 24 ou uma versão moderna compatível.
* pnpm 10.
* Um banco PostgreSQL.
* Uma chave da Groq.

Em produção, o Dockerfile usa `node:24-slim` e ativa `pnpm@10.19.0` com Corepack.

## Variáveis de ambiente

A API precisa destas variáveis:

| Variável | Obrigatória | Para que serve |
| --- | --- | --- |
| `DATABASE_URL` | Sim | URL PostgreSQL usada pelo Prisma |
| `GROQ_API_KEY` | Sim | Chave da Groq usada para gerar handlers |
| `PORT` | Não | Porta do servidor. Padrão: `10000` |
| `NODE_ENV` | Não | `development`, `production` ou `test` |

Exemplo para desenvolvimento local:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/webhook_inspect"
GROQ_API_KEY="gsk_..."
PORT=3333
NODE_ENV=development

```

> [!IMPORTANT]
> Não coloque URLs reais de banco nem chaves de API no repositório. Use `api/.env` localmente e as variáveis de ambiente do Render em produção.

## Rodando localmente

Instale as dependências:

```bash
pnpm install

```

Gere o Prisma Client:

```bash
pnpm --dir api db:generate

```

Aplique as migrations no seu banco:

```bash
pnpm --dir api db:migrate:deploy

```

Suba API e web juntos:

```bash
pnpm dev

```

Em desenvolvimento, a API lê o `api/.env`. O frontend roda no Vite e usa proxy para `/api` e `/capture`, então as chamadas continuam relativas e funcionam igual no deploy.

## Como usar

Com a API rodando, envie um webhook para:

```txt
http://localhost:3333/capture/seu/provedor/caminho

```

Exemplo rápido:

```bash
curl -X POST http://localhost:3333/capture/stripe/payment \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.succeeded","amount":4900}'

```

Depois abra a interface, selecione um ou mais webhooks e clique em **Gerar handler**. O código aparece em uma modal clara, pronto para copiar.

## Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `ANY` | `/capture/*` | Captura webhooks recebidos |
| `GET` | `/api/v1/webhooks` | Lista webhooks com paginação por cursor |
| `GET` | `/api/v1/webhooks/:id` | Busca um webhook específico |
| `DELETE` | `/api/v1/webhooks/:id` | Remove um webhook |
| `POST` | `/api/v1/generate` | Gera um handler TypeScript com base nos webhooks selecionados |
| `GET` | `/docs` | Referência da API |

## Banco e migrations

O projeto usa Prisma Migrate. Para ambientes que não são de desenvolvimento, use:

```bash
pnpm --dir api db:migrate:deploy

```

No Docker, o comando de produção da API é:

```bash
pnpm --dir api start:prod

```

Esse script roda `prisma migrate deploy` e, em seguida, inicia a API compilada com `node dist/server.js`.

> [!TIP]
> Para Neon, coloque a URL PostgreSQL como `DATABASE_URL` no Render. A migration de produção já foi aplicada no banco Neon configurado durante a preparação deste projeto. Se o Prisma falhar com `channel_binding=require`, use a mesma URL sem `channel_binding`, mantendo `sslmode=require`.

## Deploy no Render

Crie um Web Service no Render apontando para este repositório.

Use Docker como runtime. O Render deve detectar o `Dockerfile` na raiz.

Configure as envs:

```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
NODE_ENV=production

```

Não precisa criar um serviço separado para o frontend. O build do Docker compila o `web`, copia o `web/dist` para a imagem final e o Fastify serve tudo pelo mesmo domínio.

O Render normalmente injeta `PORT`. Se não injetar, a API usa `10000`.

## Comandos úteis

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe API e web em desenvolvimento |
| `pnpm --dir api typecheck` | Valida TypeScript da API |
| `pnpm --dir web build` | Builda o frontend |
| `pnpm build` | Builda API e frontend |
| `pnpm --dir api db:generate` | Gera o Prisma Client |
| `pnpm --dir api db:migrate:deploy` | Aplica migrations versionadas |
| `pnpm --dir api start` | Inicia a API compilada |

## Problemas comuns

### A interface parece antiga depois de uma mudança

Se você está acessando o app servido pela API, gere o build do frontend de novo:

```bash
pnpm --dir web build

```

Depois reinicie a API ou o container e faça um hard refresh no navegador.

### O Prisma não conecta no Neon

Confira estes pontos:

* `DATABASE_URL` está definida no ambiente onde o comando roda.
* A URL usa `sslmode=require`.
* A URL real não foi commitada no repositório.
* O banco Neon está ativo e acessível.

### O código gerado veio com crases de Markdown

A API e o frontend removem automaticamente blocos de código Markdown. O prompt também instrui o modelo a devolver somente TypeScript puro.

## Observações para produção

Este app salva o corpo dos webhooks recebidos para facilitar inspeção e aprendizado. Antes de expor para uma equipe ou cliente, adicione autenticação no painel, validação de assinatura dos provedores, máscara para campos sensíveis e uma política clara de retenção de dados.