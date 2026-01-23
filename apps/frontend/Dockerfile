# Build stage
FROM node:20-alpine AS builder

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# Copy package files first (for better caching)
# Note: We need all workspace package.json files because yarn.lock contains all workspaces
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Copy source code (node_modules excluded by .dockerignore)
COPY . .

# Install dependencies (installs all workspaces, but we only build frontend)
RUN yarn install --immutable

# Build only frontend
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

