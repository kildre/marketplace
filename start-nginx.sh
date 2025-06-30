#!/bin/sh
set -e

# Create necessary directories with correct permissions
mkdir -p /tmp/nginx/client_temp
mkdir -p /tmp/nginx/proxy_temp
mkdir -p /tmp/nginx/fastcgi_temp
mkdir -p /tmp/nginx/uwsgi_temp
mkdir -p /tmp/nginx/scgi_temp

# Verify nginx configuration
nginx -t

# Start nginx
exec nginx -g "daemon off;"
