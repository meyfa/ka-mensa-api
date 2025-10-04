FROM node:22.20.0-alpine AS base


FROM base AS build
WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm ci

# copy in app code and build it
COPY . .
RUN npm run build


FROM base
WORKDIR /usr/src/app

RUN apk add --no-cache tini

# install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

# add the already compiled code
COPY --from=build /usr/src/app/dist dist

# we listen on :8080 by default
EXPOSE 8080

# use tini as init process since Node.js isn't designed to be run as PID 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--enable-source-maps", "--disable-proto=delete", "dist/server.js"]
