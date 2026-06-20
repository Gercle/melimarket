FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

# En dev, nodemon recarga automáticamente cuando editás un archivo
CMD ["npm", "run", "dev"]
