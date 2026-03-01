# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – deps
#   Install only production dependencies inside a clean layer so that the
#   final image does not contain devDependencies or build tooling.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifest files only — leverages Docker layer caching.
# The RUN step is re-executed only when package*.json changes.
COPY package.json package-lock.json* ./

RUN npm ci --omit=dev --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – runner
#   Minimal production image.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Add dumb-init to handle PID 1 signals correctly (graceful shutdown)
RUN apk add --no-cache dumb-init

# Run as non-root for least-privilege security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package.json ./

# Switch to non-root user
USER appuser

# Document the port the service listens on
EXPOSE 3001

ENV NODE_ENV=production

# Use dumb-init as PID 1 to forward signals correctly to Node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
