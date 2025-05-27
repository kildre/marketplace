# Use Node.js as base image for local development
# For production, change to: 
ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"
# ARG BASE_IMAGE="node:22"   

# Build stage
FROM "${BASE_IMAGE}" AS build

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY app/package*.json ./

# Install dependencies
RUN npm install --prefer-offline --legacy-peer-deps

# Copy source code
COPY app/ .

# Build the application
RUN npm run build

# Production stage
FROM "${BASE_IMAGE}" AS runtime

# Install serve globally for serving static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create and switch to non-root user
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser
RUN chown -R nodeuser:nodeuser /app
USER nodeuser

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the application
CMD ["serve", "-s", "dist", "-l", "8080"]



