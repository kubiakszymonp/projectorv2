# Projector

A modern monorepo-based church presentation system for managing and displaying text content (songs, readings, etc.) and media.

## Architecture

This project uses Yarn Berry workspaces to manage a monorepo containing:

- **Backend** (`apps/backend`) - NestJS application with WebSocket support
- **Frontend** (`apps/frontend`) - React + TypeScript with Vite
- **Shared** (`packages/shared`) - Common types and utilities

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: LTS version)
- Yarn 4.12.0+ (configured via Yarn Berry)

### Installation

```bash
# Install all dependencies across workspaces
yarn install
```

### Development

```bash
# Run both frontend and backend in parallel
yarn dev

# Or run individually
cd apps/backend && yarn dev
cd apps/frontend && yarn dev
```

### Build

```bash
# Build all workspaces
yarn build
```

### Lint

```bash
# Lint all workspaces
yarn lint
```

## Project Structure

```
projector/
├── apps/
│   ├── backend/          # NestJS backend
│   │   └── src/
│   │       ├── modules/  # Feature modules
│   │       │   ├── texts/
│   │       │   ├── playlists/
│   │       │   ├── media/
│   │       │   ├── player/
│   │       │   └── settings/
│   │       └── common/   # Shared backend utilities
│   └── frontend/         # React + Vite frontend
├── packages/
│   └── shared/           # Shared TypeScript types
└── package.json          # Root workspace configuration
```

## Technologies

### Backend
- NestJS 11.x
- Socket.IO for real-time communication
- TypeScript 5.x
- Class Validator & Class Transformer
- Zod for schema validation

### Frontend
- React 19.x
- Vite 7.x
- React Router 7.x
- TanStack Query (React Query)
- Zustand for state management
- Socket.IO Client
- TypeScript 5.x

### Shared
- TypeScript types shared between frontend and backend

## License

UNLICENSED - Private project
