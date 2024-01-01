FROM node:21.5.0-slim

# Adapted from https://nodejs.org/en/docs/guides/nodejs-docker-webapp
# docker build to be run from parent directory

# Create app directory
WORKDIR /ais

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . ./

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "startmon" ]


