# Set base image for node-fips
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ------------------------------
# 1) TOOLING STAGE - esbuild patch
# ------------------------------
FROM alpine:3.19 AS esbuild-patch
RUN apk add --no-cache curl tar
WORKDIR /tmp/esbuild
RUN curl -L -o esbuild.tgz https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.22.2.tgz \
    && tar -xzf esbuild.tgz

# ------------------------------
# 2) BUILD STAGE
# ------------------------------
FROM "${BASE_IMAGE}-dev" AS builder

# Use root to prep build environment
USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"

RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && chown -R node:node "${APP_ROOT}"

# Switch to non-root user
USER node
WORKDIR "${APP_FRONTEND_DIR}"

# Install deps
COPY --chown=node:node frontend/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Replace esbuild binary with clean version from tooling stage
COPY --from=esbuild-patch /tmp/esbuild/package/bin/esbuild node_modules/@esbuild/linux-x64/bin/esbuild

# Build app
COPY --chown=node:node frontend/ . 
RUN npm run build

# ------------------------------
# 3) RUNTIME STAGE
# ------------------------------
FROM "${BASE_IMAGE}" AS server

USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"
ENV PATH="/usr/local/bin:$PATH"
ENV NODE_ENV=production

RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && chown -R node:node "${APP_ROOT}"

USER node
WORKDIR "${APP_FRONTEND_DIR}"

# Copy production files
COPY --from=builder --chown=node:node "${APP_FRONTEND_DIR}/dist" ./dist
COPY --from=builder --chown=node:node "${APP_FRONTEND_DIR}/package*.json" ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Expose and healthcheck
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start app
CMD ["sh", "-c", "exec ./node_modules/.bin/sirv dist --port 8080 --host 0.0.0.0 --single --cors"]
