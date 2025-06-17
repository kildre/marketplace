# ---- BASE IMAGE ----
#ARG BASE_IMAGE="231134345536.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
# ---- BUILD STAGE ----
FROM "${BASE_IMAGE}-dev" AS builder

USER root

ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"
ENV APP_BACKEND_DIR="${APP_ROOT}/backend"

# Create necessary directories
RUN mkdir -p "${APP_FRONTEND_DIR}" "${APP_BACKEND_DIR}"

# Set up NPM configuration
RUN npm config set strict-ssl=false
RUN npm set @advana:registry=https://nexus.cdao.us/repository/advana-npm-group/

# Copy frontend files and install dependencies
COPY --chmod=775 ./frontend/ "${APP_FRONTEND_DIR}/"
WORKDIR "${APP_FRONTEND_DIR}"
RUN npm install
RUN npm run build

# Move built frontend files to backend directory (to be served by Express)
RUN mv dist "${APP_BACKEND_DIR}/dist"

# Copy backend files and install dependencies
COPY --chmod=775 ./backend/ "${APP_BACKEND_DIR}/"
WORKDIR "${APP_BACKEND_DIR}"
RUN npm install

# ---- FINAL STAGE ----
FROM "${BASE_IMAGE}" AS server

USER root

ENV APP_UID=65532
ENV APP_GID=65532
ENV APP_ROOT="/app"
ENV APP_BACKEND_DIR="${APP_ROOT}/backend"

# Create backend directory
RUN mkdir -p "${APP_BACKEND_DIR}"

# Copy everything from builder
COPY --chmod=775 --from=builder "${APP_BACKEND_DIR}" "${APP_BACKEND_DIR}"

# Set permissions
RUN chmod -R g-s "${APP_ROOT}" \
    && chown -R "${APP_UID}":"${APP_GID}" "${APP_ROOT}"

# Ensure PATH is properly set for the non-root user and verify node/npm availability
ENV PATH="/usr/local/bin:${PATH}"
RUN which node && which npm

# Find and store the actual paths for node and npm
RUN echo "#!/bin/sh" > /usr/local/bin/start-app.sh && \
    echo "exec \$(which node) index.js" >> /usr/local/bin/start-app.sh && \
    chmod +x /usr/local/bin/start-app.sh

USER "${APP_UID}":"${APP_GID}"

# Expose port used by Express
EXPOSE 8080

WORKDIR "${APP_BACKEND_DIR}"

# Start the Express server - use our startup script that finds node dynamically
CMD ["/usr/local/bin/start-app.sh"]
