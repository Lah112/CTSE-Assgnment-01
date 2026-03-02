# =============================================================================
# Stage 1 — deps
# Install only production dependencies in an isolated layer so the final
# image contains no build tools or dev packages.
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching.
# The RUN layer is only re-executed when package*.json actually changes.
COPY package*.json ./

RUN npm ci --omit=dev

# =============================================================================
# Stage 2 — runner (production image)
# Copies only the installed node_modules and app source from stage 1.
# Result: a minimal, hardened Alpine image with no build tools.
# =============================================================================
FROM node:20-alpine AS runner

# dumb-init replaces PID 1 to correctly forward OS signals (SIGTERM/SIGINT)
# to the Node process, enabling graceful shutdown inside containers.
RUN apk add --no-cache dumb-init

# Create a non-root user/group to run the application.
# Running as root inside a container is a security anti-pattern.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package.json ./

# Transfer ownership to the non-root user before switching to it
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3003

ENV NODE_ENV=production

# Use dumb-init as the entrypoint wrapper so Node receives signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
