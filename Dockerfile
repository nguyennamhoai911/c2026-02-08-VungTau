FROM node:20-alpine

WORKDIR /app

COPY tide-app/package*.json ./
RUN npm install

COPY tide-app/ ./

EXPOSE 3000

CMD ["npm", "start"]
