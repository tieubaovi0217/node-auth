FROM node:12-alpine as builder
WORKDIR /usr/app
COPY . ./
RUN npm install \
  && npm run build

FROM node:12-alpine
WORKDIR /usr/app
COPY --from=builder /usr/app/build ./
COPY package*.json ./
RUN npm install --production \
  && npm install -g pm2
EXPOSE 5000
CMD ["pm2-runtime", "index.js"]
