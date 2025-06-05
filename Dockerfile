# ---------- ARGs ----------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ---------- BUILD STAGE ----------
FROM ${BASE_IMAGE}-dev AS build

#FROM node:18.20 AS build

USER node
WORKDIR /app/app

# 1) Copy only the package files into the app directory
COPY --chown=node:node app/package*.json ./

# 2) Install deps inside app/
RUN npm install --prefer-offline --legacy-peer-deps

# 3) Copy the rest of your source into app/
COPY --chown=node:node app/ .

# 4) Build the Vite/React app
RUN npm run build

# ---------- RUNTIME STAGE ----------
# Switch to nginx Alpine image (currently 1.27.x which includes the latest security patches):
FROM nginx:alpine AS runtime

# 1) (Optional) If you want to double-check versions, you can upgrade all installed Alpine packages
#    so they move to the latest security-fixed releases in the Alpine 3.20 repo:
RUN apk update && \
    apk upgrade libxml2 curl libcurl libcrypto3 libssl3 libexpat libxslt xz-libs && \
    rm -rf /var/cache/apk/*

# 2) (Optional) Sanity check that the vulnerable packages are now at fixed versions
RUN apk info libxml2 curl libcurl libcrypto3 libssl3 libexpat libxslt xz-libs

# 3) Copy the built application from the build stage
COPY --from=build /app/app/dist /usr/share/nginx/html

# 4) Copy nginx configuration (better to use external config file for HELM deployments)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 5) Change ownership of nginx directories to allow non-root execution
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]