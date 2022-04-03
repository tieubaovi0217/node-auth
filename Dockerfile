FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

RUN npm install -g pm2

COPY . .

CMD ["npm", "run", "serve"]

EXPOSE 5000