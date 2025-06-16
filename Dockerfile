ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ------------------------------
# 1) BUILD STAGE
# ------------------------------
FROM "${BASE_IMAGE}-dev" AS builder

# run as root to mkdir & chown
USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"

# create frontend dir and give ownership to node user
RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && chown -R node:node "${APP_ROOT}"

# switch to non-root
USER node
WORKDIR "${APP_FRONTEND_DIR}"

# install dependencies
COPY --chown=node:node frontend/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# copy source & build
COPY --chown=node:node frontend/ . 
RUN npm run build

# ------------------------------
# 2) RUNTIME STAGE
# ------------------------------
FROM "${BASE_IMAGE}" AS server

# run as root to mkdir & chown
USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"
ENV PATH="/usr/local/bin:$PATH"
ENV NODE_ENV=production

RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && chown -R node:node "${APP_ROOT}"

# switch to non-root
USER node
WORKDIR "${APP_FRONTEND_DIR}"

# copy build output and package manifests
COPY --from=builder --chown=node:node "${APP_FRONTEND_DIR}/dist" ./dist
COPY --from=builder --chown=node:node "${APP_FRONTEND_DIR}/package*.json" ./

# install production dependencies (e.g. sirv or vite preview)
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# expose & healthcheck
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Use node to run sirv directly instead of npm
CMD ["node", "./node_modules/.bin/sirv", "dist", "--port", "8080", "--host", "0.0.0.0", "--single", "--cors"]
