# ---------- ARGs ----------
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# ---------- BUILD STAGE ----------
FROM ${BASE_IMAGE}-dev AS build

# ---------- Comment out Lines 1 - 5 Uncomment Line 8 for local build ----------
#FROM node:18.20.4 AS build

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
# Comment/Uncomment ${BASE_IMAGE} = production node:18.20 = local testing
FROM ${BASE_IMAGE}
#FROM node:18.20.4
WORKDIR /app


# Copy the built application from build stage
COPY --from=build /app/app/dist ./dist


# Install a tiny static server (serve) globally
RUN npm install --global serve

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["serve", "-s", "dist", "-l", "8080"]