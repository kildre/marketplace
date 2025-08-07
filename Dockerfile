ARG BASE_IMAGE="231134345536.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
FROM "${BASE_IMAGE}-dev" AS builder
USER root
ENV APP_UID=65532
ENV APP_GID=65532
# key dirs & globally usable binaries/packages
ENV APP_ROOT="/app"
ENV APP_FRONTEND_DIR="${APP_ROOT}/frontend"
RUN mkdir -p "${APP_FRONTEND_DIR}"
# smoke test
RUN node -v
RUN npm -v
RUN npm config set strict-ssl=false
RUN npm set @advana:registry=https://nexus.cdao.us/repository/advana-npm-group/
# note on copy+chown: do not use $USER var, it will - surprisingly - be root
COPY --chmod=775 ./frontend/ "${APP_FRONTEND_DIR}/"
RUN cd "${APP_FRONTEND_DIR}" \
    && npm install \
    && npm run build

# Use nginx for serving static files - using latest version to avoid tiff vulnerability in alpine-minirootfs-3.22.0
FROM nginx:1.27-alpine AS server
ENV APP_UID=65532
ENV APP_GID=65532

# Security hardening: Remove vulnerable packages and update all packages
RUN apk update && \
    apk upgrade && \
    # Force remove vulnerable packages and their dependencies
    apk del --purge --force \
    tiff \
    curl \
    busybox \
    ssl_client \
    libtiff \
    tiff-dev \
    libtiff-dev 2>/dev/null || true && \
    # Remove any tiff-related files manually
    find / -name "*tiff*" -type f -delete 2>/dev/null || true && \
    find / -name "*libtiff*" -type f -delete 2>/dev/null || true && \
    # Install minimal busybox for essential functionality
    apk add --no-cache \
    busybox-static && \
    # Verify tiff is completely removed
    apk info | grep -i tiff || echo "tiff packages successfully removed" && \
    rm -rf /var/cache/apk/*

# Copy the built React app from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy complete nginx configuration (eliminates user directive warning)
COPY nginx.conf.full /etc/nginx/nginx.conf

# Create user and group to match your existing setup
RUN addgroup -g ${APP_GID} appgroup && \
    adduser -D -u ${APP_UID} -G appgroup appuser

# Set proper ownership
RUN chown -R ${APP_UID}:${APP_GID} /usr/share/nginx/html
RUN chown -R ${APP_UID}:${APP_GID} /var/cache/nginx
RUN chown -R ${APP_UID}:${APP_GID} /var/log/nginx
RUN chown -R ${APP_UID}:${APP_GID} /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && chown -R ${APP_UID}:${APP_GID} /var/run/nginx.pid

USER ${APP_UID}:${APP_GID}

# Add healthcheck to address compliance requirements - using nc to avoid wget dependency
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD nc -z localhost 8080 || exit 1

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
