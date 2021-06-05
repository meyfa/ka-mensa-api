FROM node:lts-alpine
WORKDIR /usr/src/app

# dependencies
COPY package*.json ./
RUN npm ci

# app source
COPY . .

# we listen on :8080 by default
EXPOSE 8080

# start command - same as in package.json
CMD ["node", "server.js"]
