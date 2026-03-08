# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1 — pruner
#
# What  : Prune the monorepo so only the files that the "backend" package
#         actually needs are kept.  Turborepo's `prune` command outputs two
#         directories inside /app/out/:
#
#   out/json/          – every package.json (and pnpm-workspace.yaml) that
#                        belongs to the pruned dependency graph.
#                        Used in the next stage to install deps WITHOUT source.
#
#   out/full/          – the complete pruned source tree (all packages needed
#                        to compile backend, i.e. @repo/db and @repo/shared
#                        too).
#
#   out/pnpm-lock.yaml – a trimmed lockfile that matches only the pruned set
#                        of packages, so `pnpm install --frozen-lockfile` is
#                        guaranteed to succeed without extra packages.
#
# Why a separate stage?  We copy only the tiny "out/" directory from here;
# the full git checkout (node_modules, .env files, etc.) never lands in any
# downstream layer.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine3.19 AS pruner

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN npm install --global turbo

WORKDIR /app
COPY . .

# --docker  produces the split out/json / out/full layout
# "backend" matches the "name" field in apps/backend/package.json
RUN turbo prune backend --docker


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2 — installer
#
# What  : Install ALL dependencies (including devDependencies) so the builder
#         stage can compile TypeScript.
#
# Key insight – we copy out/json/ FIRST (just package.json + lockfile), run
# `pnpm install`, and only THEN copy out/full/ (source).  This means Docker
# can cache the "install" layer separately from the "source changed" layer.
# If you only change a .ts file pnpm install is NOT re-run on rebuild.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine3.19 AS installer

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy pruned manifest files (package.json tree + pnpm-workspace.yaml)
COPY --from=pruner /app/out/json/ .
# Copy pruned lockfile (matches the pruned package graph exactly)
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install all deps (dev included – needed to compile TS in the next stage)
RUN pnpm install --frozen-lockfile


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 3 — builder
#
# What  : Compile every package in dependency order.
#         turbo.json has  "build": { "dependsOn": ["^build"] }
#         which means Turbo automatically:
#           1. builds @repo/shared  first
#           2. builds @repo/db      second  (depends on shared)
#           3. builds backend       last    (depends on db + shared)
#
# --filter=backend  tells Turbo "build backend and honour its ^build chain".
# We do NOT need ...backend or backend... here because Turbo walks the
# dependsOn graph for us automatically.
# ─────────────────────────────────────────────────────────────────────────────
FROM installer AS builder

# Copy full pruned source on top of the installed node_modules
COPY --from=pruner /app/out/full/ .

# Generate the Prisma Client for the target architecture (linux/alpine).
# This creates:
#   packages/db/node_modules/.prisma/client/  – query-engine binary + JS shim
RUN cd packages/db && pnpm exec prisma generate

# Build all packages that backend depends on, then backend itself.
# "backend" matches the "name" in apps/backend/package.json  (NOT the root
# workspace name "banau" which was the previous bug here).
RUN pnpm turbo run build --filter=backend


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 4 — production
#
# What  : Minimal runtime image – only production deps + compiled JS.
#         No TypeScript, no dev tools, no source files.
#
# Why install again?  `--prod` skips devDependencies, giving a much smaller
# node_modules.  We use the pruned json/lockfile (not the raw repo files) so
# pnpm can correctly resolve workspace:* packages (@repo/db, @repo/shared)
# by symlinking them to their directories inside this image.
#
# After `pnpm install --prod` the symlinks exist but the packages have no
# compiled code yet – we THEN copy the dist/ directories from the builder so
# the symlinks resolve to working JS modules.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine3.19 AS production

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# ── 1. Use the PRUNED manifests so workspace:* deps resolve correctly ────────
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# ── 2. Production-only install (no devDependencies) ─────────────────────────
#    workspace:* packages (@repo/db, @repo/shared) become symlinks under
#    node_modules/@repo/db  →  ../../packages/db
#    node_modules/@repo/shared  →  ../../packages/shared
RUN pnpm install --frozen-lockfile --prod

# ── 3. Copy compiled backend ─────────────────────────────────────────────────
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# ── 4. Copy compiled @repo/db (main = ./dist/index.js) ──────────────────────
#    FIX: previously only prisma/ and .prisma/ were copied; dist/ was missing
#    so `require('@repo/db')` would throw MODULE_NOT_FOUND at startup.
COPY --from=builder /app/packages/db/dist         ./packages/db/dist
COPY --from=builder /app/packages/db/prisma       ./packages/db/prisma
# Copy Prisma query-engine binary built for linux-musl (alpine)
COPY --from=builder /app/packages/db/node_modules/.prisma ./packages/db/node_modules/.prisma

# ── 5. Copy compiled @repo/shared (main = ./dist/index.js) ──────────────────
#    FIX: previously packages/shared/src (TypeScript files) was copied, but
#    Node.js needs the compiled JS at dist/index.js – .ts files are NOT valid
#    at runtime and `require('@repo/shared')` would crash immediately.
COPY --from=builder /app/packages/shared/dist     ./packages/shared/dist

# ── Runtime config ───────────────────────────────────────────────────────────
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/backend/dist/main.js"]
