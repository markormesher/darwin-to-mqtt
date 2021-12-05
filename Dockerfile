FROM node:fermium
WORKDIR /darwin

COPY package.json yarn.lock ./
RUN yarn install

COPY ./src ./src

CMD node ./src/index.js
