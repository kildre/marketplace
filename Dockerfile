ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
FROM "${BASE_IMAGE}-dev" AS builder

ENV APP_UID=65532
ENV APP_GID=65532

# key dirs & globally usable binaries/packages
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="/app/frontend"

# Create directory as root, then switch to node user
USER root
RUN mkdir -p "${APP_FRONTEND_DIR}" && chown -R node:node "${APP_ROOT}"

USER node
WORKDIR "${APP_FRONTEND_DIR}"

# install ALL deps (including whatever you need to build and to serve)
COPY --chown=node:node frontend/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# copy source & build
COPY --chown=node:node frontend/ . 
RUN npm run build

# ------------------------------
# 2) RUNTIME STAGE
# ------------------------------

FROM "${BASE_IMAGE}" AS server

ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="/app/frontend"

# Create directory as root, then switch to node user
USER root
RUN mkdir -p "${APP_FRONTEND_DIR}" && chown -R node:node "${APP_ROOT}"

USER node
WORKDIR "${APP_FRONTEND_DIR}"

# Copy only dist and package manifests
COPY --from=builder --chown=node:node "${APP_FRONTEND_DIR}/dist" ./dist
COPY --from=builder --chown=node:node "${APP_FRONTEND_DIR}/package*.json" ./

# Install production deps (so sirv is available locally, not globally)
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Listen on 8080; Kubernetes Ingress will handle TLS/routing
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Launch via vite preview
WORKDIR "${APP_FRONTEND_DIR}"
CMD ["npm", "run", "start"]