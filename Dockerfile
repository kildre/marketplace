ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"   

# build stage should use -dev image to RUN commands
# https://edu.chainguard.dev/chainguard/chainguard-images/overview/#why-minimal-container-images
FROM "${BASE_IMAGE}-dev" AS build

# build the app as node
USER node

WORKDIR /app
COPY --chown=node:node . .

# disable nextjs telemetry during the build (https://nextjs.org/telemetry)
## ENV NEXT_TELEMETRY_DISABLED 1
# clean install ALL dependencies, build from src, then just install the prod 
# dependencies. no need to delete node_modules or anything, npm ci takes care
# of that for us. delete the .npmrc so we're not deploying that internal IP

RUN npm install --prefer-offline --legacy-peer-deps
RUN npm run build
RUN npm install --prefer-offline --omit=dev --legacy-peer-deps
RUN rm -rf .npmrc .yarnrc .husky secrets

#Remove test folder from resolve node_module to remediate anchore fail for https://github.com/advisories/GHSA-2jcg-qqmg-46q6
#the package.json in this test folder has a library name that isn't safe to use
RUN rm -rf .npmrc .yarnrc .husky secrets node_modules/resolve/test

# runtime stage should use non-dev image to deploy minimal image
FROM $BASE_IMAGE AS runtime

# run the app as node
USER node

# make sure we're running in production mode
ENV NODE_ENV production
# disable nextjs telemetry during runtime (https://nextjs.org/telemetry)
## ENV NEXT_TELEMETRY_DISABLED 1

# copy the entire build dir
WORKDIR /app
COPY --from=build /app/dist ./dist

# If the base image doesn’t include `serve`, COPY it from build:
COPY --from=build /app/node_modules/.bin/serve /usr/local/bin/serve

# expose port for HTTP only: should match the helm chart's targetPort value
# in deployment.web.service.ClusterIP.ports
EXPOSE 8080

# start the app as a basic node.js app
# Run static site server
CMD ["serve", "-s", "dist", "-l", "8080"]



