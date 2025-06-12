ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
FROM "${BASE_IMAGE}-dev" AS builder

USER root

ENV APP_UID=65532
ENV APP_GID=65532

# key dirs & globally usable binaries/packages
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="/app/frontend"

RUN mkdir -p "${APP_FRONTEND_DIR}"

WORKDIR "${APP_FRONTEND_DIR}"

# install ALL deps (including whatever you need to build and to serve)
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# copy source & build
COPY --chmod=775 frontend/ . 
RUN npm run build

# ------------------------------
# 2) RUNTIME STAGE
# ------------------------------

FROM "${BASE_IMAGE}" AS server


USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="/app/frontend"

# Create directory
RUN mkdir -p "${APP_FRONTEND_DIR}"
WORKDIR "${APP_FRONTEND_DIR}"

# Copy only dist and package manifests
COPY --from=builder "${APP_FRONTEND_DIR}/dist" ./dist
COPY --from=builder "${APP_FRONTEND_DIR}/package*.json" ./
COPY --from=builder "${APP_FRONTEND_DIR}/serve.json" ./

# Install production deps (so serve is available locally, not globally)
RUN npm ci --omit=dev --legacy-peer-deps

# Fix permissions
RUN chmod -R g-s "${APP_ROOT}" \
    && chown -R "${APP_UID}":"${APP_GID}" "${APP_ROOT}"

USER "${APP_UID}":"${APP_GID}"

# Listen on 8080; Kubernetes Ingress will handle TLS/routing
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Launch via vite preview
WORKDIR "${APP_FRONTEND_DIR}"
CMD ["npm", "run", "start"]