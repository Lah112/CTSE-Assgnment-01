# =============================================================================
# Stage 1 — build
# Uses node:20-alpine to install dependencies and run `vite build`.
# Build-time VITE_ environment variables are injected as Docker build args
# so the correct service URLs are baked into the static bundle.
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy manifests first — Docker caches this layer until package*.json changes
COPY package*.json ./
RUN npm ci

# Inject microservice URLs as build-time args (passed via --build-arg in CI)
ARG VITE_AUTH_SERVICE_URL
ARG VITE_BOOKING_SERVICE_URL
ARG VITE_INVENTORY_SERVICE_URL
ARG VITE_BILLING_SERVICE_URL

ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ENV VITE_BOOKING_SERVICE_URL=$VITE_BOOKING_SERVICE_URL
ENV VITE_INVENTORY_SERVICE_URL=$VITE_INVENTORY_SERVICE_URL
ENV VITE_BILLING_SERVICE_URL=$VITE_BILLING_SERVICE_URL

COPY . .
RUN npm run build

# =============================================================================
# Stage 2 — runner
# A minimal nginx:alpine image that serves the compiled React bundle on port 80.
# The build tools and node_modules from Stage 1 are NOT included — the final
# image is just nginx + the /dist output (~15 MB total).
# =============================================================================
FROM nginx:alpine AS runner

# Remove the default nginx config and replace with our SPA-aware config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the compiled Vite output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx starts automatically as the container's PID 1
CMD ["nginx", "-g", "daemon off;"]
