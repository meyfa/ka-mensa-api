# -- compilation --
FROM node:18-alpine as build
WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm ci

# copy in app code and build it
COPY . .
RUN npm run build


# -- execution --
FROM node:18-alpine
WORKDIR /usr/src/app

# install PRODUCTION dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# add the already compiled code
COPY --from=build /usr/src/app/dist dist

# we listen on :8080 by default
EXPOSE 8080

# start the server (this is similar to "npm run production", but NPM does not
# forward signals correctly, while Node does)
CMD ["node", "dist/server.js"]
