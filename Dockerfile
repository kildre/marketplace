# ---------- BASE SETUP ----------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

################################################################################
# BUILD STAGE
################################################################################
FROM "${BASE_IMAGE}-dev" AS build

# Run as non‑root user
USER node

WORKDIR /app

# 1) Copy package files for caching
COPY --chown=node:node app/package*.json ./app/

# 2) Install node_modules
RUN npm install --prefer-offline --legacy-peer-deps

# 3) Copy the rest of your source
COPY --chown=node:node . .

# 4) Build the Vite app (inside app/)
WORKDIR /app/app
RUN npm run build

# 5) Clean up any unwanted files/modules
WORKDIR /app
RUN rm -rf \
    .npmrc .yarnrc .husky secrets \
    node_modules/resolve/test

################################################################################
# RUNTIME STAGE
################################################################################
FROM ${BASE_IMAGE} AS runtime

# Run as non‑root user
USER node

WORKDIR /app

# Production env vars
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install static server
RUN npm install -g serve@^14

# Copy built assets from build stage
COPY --from=build /app/app/dist ./dist

# Expose the port your Helm chart (or k8s Service) expects
EXPOSE 8080

# Optional healthcheck for readiness/liveness probes
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Serve the React build
CMD ["serve", "-s", "dist", "-l", "8080", "--no-clipboard", "--single"]
