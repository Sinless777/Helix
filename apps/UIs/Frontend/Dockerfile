# syntax=docker/dockerfile:1.4
################################################################################
# 1. Base image with common tooling
################################################################################
FROM node:lts-alpine AS base
WORKDIR /app

# install dumb-init (and any other OS deps you need)
RUN apk add --no-cache dumb-init wget

################################################################################
# 2. Dependencies only for apps/UIs/Frontend
################################################################################
FROM base AS deps
# copy lockfile and root package.json
COPY pnpm-lock.yaml package.json ./

# copy only the Frontend app’s package.json
COPY apps/UIs/Frontend/package.json apps/UIs/Frontend/

# activate pnpm & install only prod + build deps for the Frontend app
RUN corepack enable \
 && corepack prepare pnpm@latest --activate \
 && pnpm install --frozen-lockfile --prod --filter ./apps/UIs/Frontend...

################################################################################
# 3. Build the Frontend
################################################################################
FROM deps AS builder
# copy your entire monorepo
COPY . .

# build only the Frontend app
RUN pnpm build --filter ./apps/UIs/Frontend...

################################################################################
# 4. Final runtime image
################################################################################
FROM base AS runner

# copy Next.js standalone output
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/UIs/Frontend/.next/standalone ./
COPY --from=builder /app/apps/UIs/Frontend/.next/static ./.next/static

# drop to non-root
RUN addgroup -S node \
 && adduser -S node -G node \
 && chown -R node:node .

USER node

EXPOSE 3000

# lightweight healthcheck against Next’s built-in endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://localhost:${PORT}/_next/health | grep ok || exit 1

CMD ["dumb-init", "node", "server.js"]
