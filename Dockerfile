FROM node:16.14.2-alpine
WORKDIR /darwin

COPY package.json yarn.lock ./
RUN yarn install

COPY ./src ./src

CMD node ./src/index.js
