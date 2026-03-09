# Base image shared by all stages
FROM node:22-alpine AS base

RUN apk update && apk upgrade
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN npm install -g turbo

WORKDIR /app


# ─────────────────────────────────────────
# STAGE 1 — pruner
# ─────────────────────────────────────────
FROM base AS pruner

COPY . .

RUN turbo prune backend --docker


# ─────────────────────────────────────────
# STAGE 2 — installer
# ─────────────────────────────────────────
FROM base AS installer

# Copy pruned manifest files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install all dependencies
RUN pnpm install --frozen-lockfile


# ─────────────────────────────────────────
# STAGE 3 — builder
# ─────────────────────────────────────────
FROM installer AS builder

# Copy full pruned source
COPY --from=pruner /app/out/full/ .

# Generate Prisma client
RUN cd packages/db && pnpm exec prisma generate

# Build backend and dependencies
RUN pnpm turbo run build --filter=backend


# ─────────────────────────────────────────
# STAGE 4 — production
# ─────────────────────────────────────────
FROM base AS production

WORKDIR /app

# Copy pruned manifests
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy compiled db package
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/db/node_modules/.prisma ./packages/db/node_modules/.prisma

# Copy compiled shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:3000/health', (r)=>{process.exit(r.statusCode===200?0:1)})"

CMD ["node","apps/backend/dist/main.js"]