ARG BASE_IMAGE="231388672283.dkr.ecr.us-gov-west-1.amazonaws.com/cgr.dev/odcfo-advana-bah/node-fips:22"

# build stage should use -dev image to RUN commands
# https://edu.chainguard.dev/chainguard/chainguard-images/overview/#why-minimal-container-images
FROM "${BASE_IMAGE}-dev" AS build

    # build the app as node
    USER node

    # copy the entire repo dir minus .dockerignore rules
    WORKDIR /app
    COPY --chown=node:node . .

    # disable nextjs telemetry during the build (https://nextjs.org/telemetry)
    ENV NEXT_TELEMETRY_DISABLED 1

    # NPM auth & config
    ARG NEXUS_USER
    ARG NEXUS_PW
    ENV NEXUS_USER=${NEXUS_USER}
    ENV NEXUS_PW=${NEXUS_PW}

    RUN export NPM_TOKEN=$(echo -n ${NEXUS_USER}:${NEXUS_PW} | base64) \
    && npm config set registry https://nexus.cdao.us/repository/advana-npm-group/ \
    && npm config set //nexus.cdao.us/repository/advana-npm-group/:_auth=${NPM_TOKEN} \
    && echo always-auth=true >> /home/node/.npmrc


    # RUN npm install --prefer-offline && \
    #     npm run build && \
    #     npm install --prefer-offline --omit=dev && \
    #     rm -rf .npmrc .husky

    # clean install ALL dependencies, build from src, then just install the prod
    # dependencies. no need to delete node_modules or anything, npm ci takes care
    # of that for us. delete the .npmrc so we're not deploying that internal IP

    RUN npm ci --prefer-offline && \
        npm run build && \
        npm ci --prefer-offline --omit=dev && \
        rm -rf .npmrc .husky

# runtime stage should use non-dev image to deploy minimal image
FROM $BASE_IMAGE AS runtime

    # run the app as node
    USER node

    # make sure we're running in production mode
    ENV NODE_ENV production
    # disable nextjs telemetry during runtime (https://nextjs.org/telemetry)
    ENV NEXT_TELEMETRY_DISABLED 1

    # copy the entire build dir
    WORKDIR /app
    COPY --from=build /app .

    # expose port for HTTP only: should match the helm chart's targetPort value
    # in deployment.web.service.ClusterIP.ports
    EXPOSE 8080

    # start the app as a basic node.js app
    CMD [ "index.js" ]
