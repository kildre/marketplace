ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
FROM "${BASE_IMAGE}-dev" AS builder
USER root
ENV APP_UID=65532
ENV APP_GID=65532
# key dirs & globally usable binaries/packages
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"
ENV APP_BACKEND_DIR="${APP_ROOT}/backend"
RUN mkdir -p \
    "${APP_BACKEND_DIR}" \
    "${APP_FRONTEND_DIR}"
# smoke test
RUN node -v
RUN npm -v
RUN npm config set strict-ssl=false
RUN npm set @advana:registry=https://nexus.cdao.us/repository/advana-npm-group/
# note on copy+chown: do not use $USER var, it will - surprisingly - be root
COPY --chmod=775 ./frontend/ "${APP_FRONTEND_DIR}/"
RUN cd "${APP_FRONTEND_DIR}" \
    && npm install
COPY --chmod=775 ./backend/ "${APP_BACKEND_DIR}/"
RUN cd "${APP_BACKEND_DIR}" \
    && npm install \
    && rm -rf ./node_modules/resolve/test 2>/dev/null || true
RUN cd "${APP_FRONTEND_DIR}" \
    && npm run build \
    && mv dist "${APP_BACKEND_DIR}/build"

FROM "${BASE_IMAGE}" AS server
ENV APP_UID=65532
ENV APP_GID=65532
USER root
ENV PATH="/app/node_modules/.bin:/app/backend/node_modules/.bin:${PATH}"
ENV APP_ROOT="/app"
ENV APP_BACKEND_DIR="${APP_ROOT}/backend"
RUN mkdir -p "${APP_BACKEND_DIR}"
# copy builds
COPY --chmod=775 --from=builder "${APP_BACKEND_DIR}" "${APP_BACKEND_DIR}"
RUN chmod -R g-s "${APP_ROOT}"
RUN chown -R "${APP_UID}":"${APP_GID}" "${APP_ROOT}"
USER "${APP_UID}":"${APP_GID}"
# Express server port
EXPOSE 8080
WORKDIR "${APP_BACKEND_DIR}"
CMD ["./index.js"]
