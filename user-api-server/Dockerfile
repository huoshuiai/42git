FROM node:20-alpine

WORKDIR /app

COPY package*.json .
COPY dist ./dist

RUN npm install --only=production

ENV PORT=3060

EXPOSE ${PORT}

CMD ["node", "dist/index.js"]
