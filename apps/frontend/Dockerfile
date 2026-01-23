# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/apps/frontend
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 10001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

