# ---------- ARGs ----------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ---------- BUILD STAGE ----------
FROM ${BASE_IMAGE}-dev AS build

# ---------- Comment out Lines 1 - 5 Uncomment Line 8 for local build ----------
# FROM node:18.20 AS build

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
FROM nginx:alpine AS runtime

# Create a non-root user for nginx
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy the built application from build stage
COPY --from=build /app/app/dist /usr/share/nginx/html

# Create nginx configuration for SPA
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Change nginx to run on port 8080 (non-privileged)
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen  \[::\]:80;/listen  [::]:8080;/' /etc/nginx/conf.d/default.conf

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