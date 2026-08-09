# ---- base ----
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

# ---- deps (cached layer) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api-server/package.json ./apps/api-server/
COPY apps/ws/package.json ./apps/ws/
COPY apps/engine/package.json ./apps/engine/
COPY apps/archiver/package.json ./apps/archiver/
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
# Install all workspace deps (needed because apps depend on @repo/*).
# --ignore-scripts skips optional native builds (bufferutil/utf-8-validate);
# Prisma client is generated in the next stage.
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---- app ----
FROM deps AS runner
ARG APP=api-server
ENV APP=$APP
ENV NODE_ENV=production

# Full source (packages export .ts, so we need the sources at runtime)
COPY . .

# Generate Prisma client into packages/database/generated/prisma
# DATABASE_URL is required by prisma.config.ts even for generate in Prisma 7 —
# use a dummy URL here; real URL comes from compose at runtime.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/probo?schema=public"
RUN pnpm --filter @repo/db db:generate

# Optional: build shared types package if anything expects its dist
RUN pnpm --filter @repo/types build || true

WORKDIR /app/apps/${APP}
EXPOSE 3000 8080
CMD ["pnpm", "start"]