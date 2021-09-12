# -- compilation --
FROM node:lts-alpine as build
WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm ci

# copy in app code and build it
COPY . .
RUN npm run build


# -- execution --
FROM node:lts-alpine
WORKDIR /usr/src/app

# install PRODUCTION dependencies
COPY package*.json ./
RUN npm ci --production

# add the already compiled code
COPY --from=build /usr/src/app/dist dist

# we listen on :8080 by default
EXPOSE 8080

# start the server ("production" skips the build step)
CMD ["npm", "run", "production"]
