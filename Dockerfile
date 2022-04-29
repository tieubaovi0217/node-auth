FROM node:12-alpine as builder
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:12-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /usr/app/build ./
RUN npm install -g pm2
EXPOSE 5000
CMD ["pm2-runtime", "index.js"]
