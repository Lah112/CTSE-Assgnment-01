# =============================================================================
# Stage 1 — deps
# Install only production dependencies in an isolated layer.
# This layer is rebuilt only when package*.json changes, not on every code edit.
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests first to maximise Docker layer-cache efficiency.
COPY package*.json ./

# npm ci installs exact versions from package-lock.json.
# --omit=dev excludes devDependencies from the production artifact.
RUN npm ci --omit=dev

# =============================================================================
# Stage 2 — runner (final production image)
# A clean Alpine image that receives only the app source and production deps.
# No build tools, no devDependencies, no Prisma — smallest possible footprint.
# =============================================================================
FROM node:20-alpine AS runner

# dumb-init acts as PID 1 and correctly forwards SIGTERM/SIGINT to the Node
# process, enabling graceful shutdown when Docker stops the container.
RUN apk add --no-cache dumb-init

# Create a dedicated non-root user and group.
# Running as root inside a container is a security anti-pattern.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Pull in production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package.json ./

# Transfer ownership before switching to the non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3004

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
