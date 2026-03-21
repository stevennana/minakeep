FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

# `next build` touches server-only config modules, so the build stage needs
# safe placeholder runtime values without shipping real secrets in the image.
ENV AUTH_SECRET=build-only-secret \
  AUTH_TRUST_HOST=true \
  DATABASE_URL=file:/tmp/minakeep-build/minakeep.db \
  OWNER_USERNAME=owner \
  OWNER_PASSWORD=build-only-password \
  MEDIA_ROOT=/tmp/minakeep-build/media \
  LOG_LEVEL=info \
  PORT=3000

# `next build` also prerenders the public homepage from Prisma-backed services,
# so the builder needs a disposable prepared SQLite database.
RUN mkdir -p /tmp/minakeep-build /tmp/minakeep-build/media \
  && npm run db:prepare \
  && npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  AUTH_TRUST_HOST=true \
  DATABASE_URL=file:/app/data/minakeep.db \
  MEDIA_ROOT=/app/media \
  LOG_LEVEL=info \
  PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /app/data /app/media /app/logs

EXPOSE 3000

CMD ["node", "scripts/container-start.mjs"]
