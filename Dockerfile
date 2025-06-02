# ---------- ARGs ----------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ---------- BUILD STAGE ----------
FROM ${BASE_IMAGE}-dev AS build

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

# (optional) clean up dev‐only stuff from build stage
WORKDIR /app
RUN rm -rf app/node_modules

# ---------- RUNTIME STAGE ----------
FROM ${BASE_IMAGE} AS runtime

# still root here
WORKDIR /app

# install the static‐file server as root
RUN npm install -g serve@^14

# now switch to non‑root “node”
USER node

ENV NODE_ENV=production

COPY --from=build /app/app/dist ./dist

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    http.get('http://localhost:8080', res => { \
    if (res.statusCode >= 200 && res.statusCode < 400) process.exit(0); \
    else process.exit(1); \
    }).on('error', () => process.exit(1));"

CMD ["serve", "-s", "dist", "-l", "8080", "--no-clipboard", "--single"]