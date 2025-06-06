# ------------------------------
# 1) BUILD STAGE
# ------------------------------
# —— PRODUCTION (us-gov-west-1 FIPS image) —— 
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
FROM "${BASE_IMAGE}-dev" AS builder

# —— LOCAL DEV (official Node 22 image) —— 
# FROM node:22 AS builder

USER root
ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"

RUN mkdir -p "${APP_FRONTEND_DIR}"
RUN node -v
RUN npm -v

# If you need a private registry, uncomment these two lines:
# RUN npm config set strict-ssl=false
# RUN npm set @advana:registry=https://nexus.cdao.us/repository/advana-npm-group/

COPY --chmod=775 ./frontend/ "${APP_FRONTEND_DIR}/"
WORKDIR "${APP_FRONTEND_DIR}"
RUN npm install --legacy-peer-deps
RUN npm run build

# ------------------------------
# 2) SERVER STAGE
# ------------------------------
# —— PRODUCTION (us-gov-west-1 FIPS) —— 
FROM "${BASE_IMAGE}" AS server

# —— LOCAL DEV (official Node 22) —— 
# FROM node:22 AS server

ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"

USER root
RUN mkdir -p "${APP_FRONTEND_DIR}"
COPY --chmod=775 --from=builder "${APP_FRONTEND_DIR}/dist" "${APP_FRONTEND_DIR}/dist"

WORKDIR "${APP_ROOT}"
RUN npm install -g serve

RUN chmod -R g-s "${APP_ROOT}" \
    && chown -R "${APP_UID}":"${APP_GID}" "${APP_ROOT}"

USER "${APP_UID}":"${APP_GID}"
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

WORKDIR "${APP_FRONTEND_DIR}"
CMD ["serve", "-s", "dist", "-l", "8080"]
