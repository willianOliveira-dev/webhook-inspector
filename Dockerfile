FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
COPY api/prisma ./api/prisma
COPY web/package.json ./web/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .

RUN pnpm run build

FROM base AS production

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json
COPY api/prisma ./api/prisma

RUN pnpm install --frozen-lockfile --prod --ignore-scripts
RUN pnpm --dir api db:generate

COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/web/dist ./web/dist

EXPOSE 10000

CMD ["pnpm", "--dir", "api", "start:prod"]
