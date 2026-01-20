# Project Information

## Overview

**Project Name**: Projector  
**Description**: A modern monorepo-based church presentation system for managing and displaying text content (songs, readings, etc.) and media.  
**Monorepo Tool**: Yarn Berry v4.12.0 with Workspaces  
**Setup Date**: January 20, 2026

## Workspace Structure

### 1. Root Workspace
- **Location**: `/`
- **Purpose**: Monorepo configuration and orchestration
- **Key Files**:
  - `package.json` - Workspace definitions and scripts
  - `.yarnrc.yml` - Yarn Berry configuration
  - `yarn.lock` - Dependency lock file

### 2. Backend Workspace
- **Location**: `apps/backend`
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7.x
- **Purpose**: REST API and WebSocket server

**Key Features**:
- WebSocket support via Socket.IO
- Modular architecture
- File upload handling (Multer)
- Schema validation (Zod + class-validator)
- YAML/Markdown parsing

**Modules Created**:
- `src/modules/texts/` - Text content management (songs, readings, etc.)
- `src/modules/playlists/` - Playlist management
- `src/modules/media/` - Media file handling
- `src/modules/player/` - Real-time presentation control
- `src/modules/settings/` - Application settings
- `src/common/` - Shared utilities

### 3. Frontend Workspace
- **Location**: `apps/frontend`
- **Framework**: React 19.x with Vite 7.x
- **Language**: TypeScript 5.9.x
- **Purpose**: User interface for presentation control

**Key Libraries**:
- React Router 7.x - Client-side routing
- TanStack Query 5.x - Server state management
- Zustand 5.x - Client state management
- Socket.IO Client 4.x - Real-time communication
- QRCode.react - QR code generation

### 4. Types (Local per workspace)
- **Backend**: `apps/backend/src/types/`
- **Frontend**: `apps/frontend/src/types/`
- **Purpose**: TypeScript types (duplicated for simpler builds)

**Usage**:
```typescript
// In backend
import { TextDoc } from '../../types';

// In frontend
import { TextDoc } from './types';
```

## Technology Stack

### Backend Dependencies
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/websockets": "^11.1.12",
  "@nestjs/platform-socket.io": "^11.1.12",
  "socket.io": "^4.8.3",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.3",
  "zod": "^4.3.5",
  "multer": "^2.0.2",
  "archiver": "^7.0.1",
  "js-yaml": "^4.1.1",
  "gray-matter": "^4.0.3",
  "ulid": "^3.0.2",
  "slugify": "^1.6.6"
}
```

### Frontend Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.12.0",
  "@tanstack/react-query": "^5.90.19",
  "zustand": "^5.0.10",
  "socket.io-client": "^4.8.3",
  "qrcode.react": "^4.2.0",
  "zod": "^4.3.5"
}
```

## Scripts

### Root Level
```bash
yarn dev      # Start all workspaces in parallel
yarn build    # Build all workspaces
yarn lint     # Lint all workspaces
```

### Backend
```bash
cd apps/backend
yarn dev      # Start with hot reload
yarn build    # Build for production
yarn start    # Start production build
yarn lint     # Run ESLint
yarn test     # Run tests
```

### Frontend
```bash
cd apps/frontend
yarn dev      # Start dev server (Vite)
yarn build    # Build for production
yarn preview  # Preview production build
yarn lint     # Run ESLint
```

## Key Configuration Files

### Yarn Berry
- `.yarnrc.yml` - Yarn configuration
- `yarn.lock` - Locked dependencies
- `.yarn/releases/yarn-4.12.0.cjs` - Yarn binary
- `.pnp.cjs` - Plug'n'Play manifest

### TypeScript
- `apps/backend/tsconfig.json` - Backend TS config
- `apps/frontend/tsconfig.json` - Frontend TS config
- `apps/backend/nest-cli.json` - NestJS CLI config

### Build Tools
- `apps/frontend/vite.config.ts` - Vite configuration
- `apps/backend/nest-cli.json` - Nest CLI configuration

## Development Workflow

1. **Make changes** in any workspace
2. **Auto-reload** - Both frontend (Vite HMR) and backend (Nest watch) support hot reload
3. **Types** - Duplicated in each workspace for simpler builds
4. **Parallel execution** - Root commands run on all workspaces simultaneously

## Package Manager Features

### Yarn Berry PnP (Plug'n'Play)
- ✅ No `node_modules` folder (faster installs)
- ✅ Strict dependency resolution
- ✅ Better performance
- ✅ Monorepo-first design

### Zero-Installs (Optional)
Currently disabled. To enable:
1. Uncomment `!.yarn/cache` in `.gitignore`
2. Run `yarn config set enableGlobalCache false`
3. Commit `.yarn/cache` to repository

## Documentation Files

- `README.md` - Main project documentation
- `QUICK_START.md` - Getting started guide
- `SETUP.md` - Setup and version details
- `PROJECT_INFO.md` - This file - comprehensive project info

## Version Summary

All packages use the latest stable versions as of **January 2026**:
- Yarn: **4.12.0** (Berry)
- Node: **18+** (recommended LTS)
- NestJS: **11.x**
- React: **19.x**
- Vite: **7.x**
- TypeScript: **5.7.x / 5.9.x**
- Socket.IO: **4.8.x**
- Zod: **4.3.x**

## Status

✅ **Monorepo structure**: Complete  
✅ **Yarn Berry setup**: Complete  
✅ **Backend scaffolding**: Complete  
✅ **Frontend scaffolding**: Complete  
✅ **Module structure**: Complete  
✅ **Dependencies installed**: Complete  
✅ **Scripts configured**: Complete  

**Ready for development!** 🚀

