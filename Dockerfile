FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .


EXPOSE 3000

CMD ["sh", "-c", "npm run migration:generate && npm run build && npm run migration:run && npm run start"]
