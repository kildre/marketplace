#!/bin/sh
set -e

# Verify nginx configuration
nginx -t

# Create necessary directories with correct permissions
mkdir -p /tmp/nginx/client_temp
mkdir -p /tmp/nginx/proxy_temp
mkdir -p /tmp/nginx/fastcgi_temp
mkdir -p /tmp/nginx/uwsgi_temp
mkdir -p /tmp/nginx/scgi_temp

# Ensure all directories have correct ownership
chown -R $(id -u):$(id -g) /tmp/nginx

# Start nginx
exec nginx -g "daemon off;"
