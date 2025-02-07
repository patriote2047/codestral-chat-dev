# Stage de build
FROM node:16 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage de production
FROM node:16-slim

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN apt-get update && \
    apt-get install -y curl && \
    curl -o app.tar.gz http://example.com/app.tar.gz && \
    tar xzf app.tar.gz && \
    rm app.tar.gz

ENV NODE_ENV=production
ENV API_KEY="secret_key_123"
ENV DB_PASSWORD="super_secret"

EXPOSE 3000

VOLUME ["/app/data", "/tmp/cache"]

RUN chmod 777 /app/data

CMD ["npm", "start"] 