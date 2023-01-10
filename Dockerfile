FROM node:16.14.2-alpine
WORKDIR /darwin

COPY package.json yarn.lock ./
RUN yarn install

COPY ./tsconfig.json ./
COPY ./src ./src
RUN yarn build

CMD ["node", "./build/index.js"]
