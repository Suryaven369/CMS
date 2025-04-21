# Dockerfile based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# Ensure `output: 'standalone'` is set in next.config.js

# ---- Base Stage ----
FROM node:22.12.0-alpine AS base

# ---- Dependencies Stage ----
FROM base AS deps
# Install git (if needed for dependencies) and libc6-compat (for some Node.js addons)
RUN apk add --no-cache libc6-compat git
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
# Using --legacy-peer-deps to handle potential peer dependency conflicts. Consider resolving these if possible.
RUN npm install --legacy-peer-deps

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

# Copy dependencies from 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source code
COPY . .

# --- Build-Time Environment Variables ---
# These ARGs receive values passed via '--build-arg' during 'docker build'
ARG PAYLOAD_SECRET
ARG DATABASE_URI
# These ENV variables make the ARGs available to commands within THIS build stage (specifically 'npm run build')
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV DATABASE_URI=${DATABASE_URI}

# Optional: Disable Next.js telemetry during build
# ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
# This command REQUIRES PAYLOAD_SECRET and DATABASE_URI to be set correctly
# via the --build-arg flags in your 'docker build' command.
RUN npm run build

# ---- Runner Stage (Final Production Image) ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Optional: Disable Next.js telemetry during runtime
# ENV NEXT_TELEMETRY_DISABLED 1

# --- Runtime Environment Variables ---
# IMPORTANT: These are PLACEHOLDERS.
# You MUST provide the actual secrets/URIs when you RUN the container.
# How you provide them depends on your deployment environment (e.g., Docker Compose, Kubernetes secrets, Cloud Run env vars, etc.)
# DO NOT hardcode sensitive production secrets here.
ENV PAYLOAD_SECRET=your_secure_payload_secret_at_runtime
ENV DATABASE_URI=your_database_uri_at_runtime
ENV PORT=3000 # Set default port

# Create non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production artifacts from 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Optional: Set permissions for server cache if needed (depends on app specifics)
# RUN mkdir .next/cache/fetch-cache
# RUN chown -R nextjs:nodejs .next/cache

# Change to non-root user
USER nextjs

EXPOSE 3000

# Run the application using the standalone server.js output
CMD HOSTNAME="0.0.0.0" node server.js
