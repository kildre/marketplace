##########################################
# Base stage: common environment setup
##########################################
FROM cgr.dev/chainguard/wolfi-base AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache nodejs-22 npm
WORKDIR /app

##########################################
# Dependencies stage
##########################################
FROM base AS deps
COPY package*.json ./
RUN npm install --omit-dev

##########################################
# Build stage
##########################################
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

##########################################
# Runtime stage
##########################################
FROM base AS runner
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app .

USER nonroot
EXPOSE 8080
CMD [ "index.js" ]

