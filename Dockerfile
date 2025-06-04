# ---------- ARGs ----------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ---------- BUILD STAGE ----------
FROM ${BASE_IMAGE}-dev AS build

# ---------- Comment out Lines 1 - 5 Uncomment Line 8 for local build ----------
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
FROM nginx:1.25-alpine AS runtime

# Force Alpine to pull the patched libxml2 (>= 2.11.8-r3)
RUN apk update && \
    apk add --no-cache libxml2=2.11.8-r3 && \
    rm -rf /var/cache/apk/*

# Copy the built application from build stage
COPY --from=build /app/app/dist /usr/share/nginx/html

# Copy nginx configuration (better to use external config file for HELM deployments)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Change ownership of nginx directories to allow non-root execution
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