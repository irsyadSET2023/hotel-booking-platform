# ─── Stage 1: deps ──────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ─── Stage 2: builder ────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before bundling
RUN bunx prisma generate

# Bundle into a single file targeting Bun runtime
RUN bun build ./src/index.ts --outdir ./dist --target=bun

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 bunjs \
 && adduser  --system --uid 1001 bunuser

# Copy the bundle and Prisma generated client
COPY --from=builder --chown=bunuser:bunjs /app/dist ./dist
COPY --from=builder --chown=bunuser:bunjs /app/generated ./generated
COPY --from=builder --chown=bunuser:bunjs /app/prisma/schema.prisma ./prisma/schema.prisma

USER bunuser

EXPOSE 8080

CMD ["bun", "./dist/index.js"]
