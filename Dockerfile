FROM node:current

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn
ADD . .
EXPOSE 3000
CMD ["yarn", "run", "serve"]