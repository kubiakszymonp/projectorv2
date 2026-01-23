# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

WORKDIR /app/apps/backend

# Expose port
EXPOSE 10000

# Set environment variable for port
ENV PORT=10000

# Start application
CMD ["node", "dist/main.js"]

