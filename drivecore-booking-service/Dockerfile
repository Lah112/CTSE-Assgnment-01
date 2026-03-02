# ════════════════════════════════════════════════════════════════════════════
# Stage 1 – deps
#   Install production dependencies only.
#   node:20-alpine is sufficient — no OpenSSL or Debian packages needed
#   because pg uses JS-native TLS (no native binary compilation required).
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests first so Docker layer cache is invalidated only when
# dependencies actually change, not on every source code edit.
COPY package*.json ./

RUN npm ci --omit=dev

# ════════════════════════════════════════════════════════════════════════════
# Stage 2 – runner (production image)
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# dumb-init handles PID 1 signal forwarding so SIGTERM reaches the Node
# process cleanly — essential for graceful shutdown on ECS/Docker.
RUN apk add --no-cache dumb-init

WORKDIR /app

# Non-root user for security — containers should never run as root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only runtime artefacts from the deps stage.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
