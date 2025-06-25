ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
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

# Use nginx for serving static files
FROM nginx:alpine AS server
ENV APP_UID=65532
ENV APP_GID=65532

# Copy the built React app from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

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

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
