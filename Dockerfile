ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ------------------------------
# 1) TOOLING STAGE (curl + tar)
# ------------------------------
FROM alpine:3.19 AS esbuild-patch
RUN apk add --no-cache curl tar
WORKDIR /tmp/esbuild
RUN curl -L -o esbuild.tgz https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz \
    && tar -xzf esbuild.tgz

# ------------------------------
# 2) BUILD STAGE
# ------------------------------
FROM "${BASE_IMAGE}-dev" AS builder

USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"

RUN mkdir -p "${APP_FRONTEND_DIR}" \
    && chown -R node:node "${APP_ROOT}"

USER node
WORKDIR "${APP_FRONTEND_DIR}"

COPY --chown=node:node frontend/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copy clean esbuild binary from tooling stage
COPY --from=esbuild-patch /tmp/esbuild/package/bin/esbuild node_modules/@esbuild/linux-x64/bin/esbuild

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
    && chown -R node:node "$
