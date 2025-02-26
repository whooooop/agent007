FROM node:20.11.1-slim

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "start"]
