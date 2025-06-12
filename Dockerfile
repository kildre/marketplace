# ------------------------------
# 1) BUILD STAGE
# ------------------------------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
FROM "${BASE_IMAGE}-dev" AS builder

# set up app dirs & user
ENV APP_UID=65532 \
    APP_GID=65532 \
    APP_ROOT=/app \
    APP_FRONTEND_DIR=${APP_ROOT}/frontend
RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && groupadd --gid "${APP_GID}" appgroup \
    && useradd --uid "${APP_UID}" --gid appgroup --shell /sbin/nologin appuser

WORKDIR "${APP_FRONTEND_DIR}"

# only copy package files to cache install
COPY frontend/package.json frontend/package-lock.json* ./

# install all dependencies (build + serve)
# npm ci is faster & more deterministic than install
RUN npm ci --legacy-peer-deps

# copy source & build
COPY --chmod=775 frontend/ .
RUN npm run build

# ------------------------------
# 2) RUNTIME STAGE
# ------------------------------
FROM "${BASE_IMAGE}" AS server

ENV APP_UID=65532 \
    APP_GID=65532 \
    APP_ROOT=/app \
    APP_FRONTEND_DIR=${APP_ROOT}/frontend

# create directory and drop root
RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && groupadd --gid "${APP_GID}" appgroup \
    && useradd --uid "${APP_UID}" --gid appgroup --shell /sbin/nologin appuser

WORKDIR "${APP_FRONTEND_DIR}"

# copy build output and manifest files only
COPY --from=builder "${APP_FRONTEND_DIR}/dist" ./dist
COPY --from=builder "${APP_FRONTEND_DIR}/package.json" .
COPY --from=builder "${APP_FRONTEND_DIR}/package-lock.json"* .

# install only production deps
RUN npm ci --omit=dev --legacy-peer-deps \
    && npm prune --production \
    && rm -rf ~/.npm

# fix permissions and switch to non-root
RUN chown -R appuser:appgroup "${APP_ROOT}" \
    && chmod -R g-s "${APP_ROOT}"
USER appuser

# expose & healthcheck
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# launch via vite preview
CMD ["npm", "run", "start"]
