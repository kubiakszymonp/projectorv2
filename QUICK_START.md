# Quick Start Guide

## Initial Setup (Already Done ✓)

The monorepo has been fully configured with:

1. ✅ Yarn Berry (v4.12.0) installed
2. ✅ Workspaces configured
3. ✅ Backend (NestJS) with all dependencies
4. ✅ Frontend (React + Vite) with all dependencies
5. ✅ Module structure created

## What Was Created

```
projector/
├── apps/
│   ├── backend/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/         # Feature modules
│   │   │   │   ├── songs/       # Songs module
│   │   │   │   ├── playlists/   # Playlists module
│   │   │   │   ├── media/       # Media module
│   │   │   │   ├── player/      # Player module
│   │   │   │   └── settings/    # Settings module
│   │   │   ├── types/           # TypeScript types
│   │   │   └── common/          # Common utilities
│   │   └── package.json
│   └── frontend/                # React + Vite
│       ├── src/
│       │   └── types/           # TypeScript types
│       └── package.json
├── package.json                 # Root workspace
├── yarn.lock
├── .yarnrc.yml
├── README.md
├── SETUP.md
└── QUICK_START.md
```

## Running the Project

### Start Everything (Recommended)

```bash
yarn dev
```

This will start both backend and frontend in parallel with live reload.

### Start Individual Services

**Backend only:**
```bash
cd apps/backend
yarn dev
```

**Frontend only:**
```bash
cd apps/frontend
yarn dev
```

## URLs (Default)

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Building for Production

```bash
yarn build
```

This builds all workspaces.

## Available Scripts

From root directory:

- `yarn dev` - Start all services in dev mode
- `yarn build` - Build all workspaces
- `yarn lint` - Lint all workspaces

## Next Steps

1. **Configure Backend Modules**
   - Implement controllers, services, and gateways in each module
   - Set up database connections if needed
   - Configure WebSocket events

2. **Configure Frontend**
   - Set up routing with React Router
   - Create components and pages
   - Configure Socket.IO client connection
   - Set up state management with Zustand

3. **Types**
   - Backend types: `apps/backend/src/types/`
   - Frontend types: `apps/frontend/src/types/`
   - Types are duplicated for simpler builds

## Adding Dependencies

**To a specific workspace:**
```bash
cd apps/backend
yarn add <package>

cd apps/frontend
yarn add <package>
```

## Troubleshooting

**If you encounter module resolution issues:**
```bash
yarn install
```

**To clean and reinstall:**
```bash
rm -rf .yarn/cache .yarn/install-state.gz .pnp.cjs .pnp.loader.mjs
yarn install
```

## Technology Stack

- **Monorepo**: Yarn Berry v4.12.0 (PnP)
- **Backend**: NestJS 11.x, Socket.IO 4.x, TypeScript 5.x
- **Frontend**: React 19.x, Vite 7.x, TypeScript 5.x
- **State**: Zustand 5.x
- **Data Fetching**: TanStack Query 5.x
- **Routing**: React Router 7.x
- **Validation**: Zod 4.x, class-validator 0.14.x

All packages use the latest stable versions as of January 2026! 🎉

