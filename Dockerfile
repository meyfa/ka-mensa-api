# -- compilation --
FROM node:20.12.2-alpine as build
WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm ci

# copy in app code and build it
COPY . .
RUN npm run build


# -- execution --
FROM node:20.12.2-alpine
WORKDIR /usr/src/app

# install PRODUCTION dependencies
COPY package*.json ./
RUN npm ci --omit=dev \
  && apk add --no-cache tini

# add the already compiled code
COPY --from=build /usr/src/app/dist dist

# we listen on :8080 by default
EXPOSE 8080

# use tini as init process since Node.js isn't designed to be run as PID 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
