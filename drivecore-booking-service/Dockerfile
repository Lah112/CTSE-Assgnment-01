# ════════════════════════════════════════════════════════════════════════════
# Stage 1 – deps
#   Install only production dependencies.
#   Using a named stage keeps the final image free of dev tooling.
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests first — Docker cache layer is invalidated only when these
# change, not on every source file edit.
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && \
    # Generate the Prisma client into node_modules
    npx prisma generate

# ════════════════════════════════════════════════════════════════════════════
# Stage 2 – runner (production image)
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# Install dumb-init — handles PID 1 responsibilities (signal forwarding,
# zombie reaping) so SIGTERM/SIGINT reach the Node process cleanly.
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create a non-root user so the container never runs as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what is needed at runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package.json ./
COPY src ./src

# Transfer ownership to the non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3002

# dumb-init as PID 1, then the app as its child process
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
