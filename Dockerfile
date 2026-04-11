# STAGE 1: Build Environment
# Updated to Node 20 to support the latest Mongoose/MongoDB drivers
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# STAGE 2: Production Environment
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Security: Switch to a non-root user
USER node

EXPOSE 3001

# Fixed to point to server.js based on your earlier code
CMD ["node", "app.js"]
