# STAGE 1: Build Environment
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# STAGE 2: Production Environment
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Security: Switch to a non-root user
USER node

EXPOSE 3001
CMD ["node", "app.js"]
