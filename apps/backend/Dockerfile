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

# Install dependencies (installs all workspaces, but we only build backend)
RUN yarn install --immutable

# Build only backend
WORKDIR /app/apps/backend
RUN yarn build

# Production stage
FROM node:20-alpine

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# Copy package files (all workspaces needed for yarn.lock)
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install production dependencies (installs all workspaces, but we only use backend)
RUN yarn install --immutable

# Copy built application from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy node_modules from builder (needed for runtime dependencies)
# In Yarn workspaces with node-modules linker, all dependencies are in root node_modules
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/backend

# Expose port
EXPOSE 10000

# Set environment variable for port
ENV PORT=10000

# Start application
CMD ["node", "dist/main.js"]

