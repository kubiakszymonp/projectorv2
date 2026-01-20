# Setup Summary

## Monorepo Configuration

This project was set up using Yarn Berry (v4.12.0) with workspaces.

## Package Versions

### Root
- Yarn: 4.12.0
- Package Manager: yarn@4.12.0

### Backend (NestJS)
**Runtime Dependencies:**
- @nestjs/common: ^11.0.1
- @nestjs/core: ^11.0.1
- @nestjs/platform-express: ^11.0.1
- @nestjs/websockets: ^11.1.12
- @nestjs/platform-socket.io: ^11.1.12
- socket.io: ^4.8.3
- class-transformer: ^0.5.1
- class-validator: ^0.14.3
- js-yaml: ^4.1.1
- gray-matter: ^4.0.3
- ulid: ^3.0.2
- slugify: ^1.6.6
- multer: ^2.0.2
- mime-types: ^3.0.2
- archiver: ^7.0.1
- zod: ^4.3.5
- @ks/shared: workspace:*

**Dev Dependencies:**
- @nestjs/cli: ^11.0.0
- @nestjs/schematics: ^11.0.0
- @nestjs/testing: ^11.0.1
- @types/express: ^5.0.0
- @types/jest: ^30.0.0
- @types/node: ^22.10.7
- @types/multer: ^2.0.0
- @types/mime-types: ^3.0.1
- @types/archiver: ^7.0.0
- @types/js-yaml: ^4
- typescript: ^5.7.3
- jest: ^30.0.0
- ts-jest: ^29.2.5

### Frontend (React + Vite)
**Runtime Dependencies:**
- react: ^19.2.0
- react-dom: ^19.2.0
- react-router-dom: ^7.12.0
- @tanstack/react-query: ^5.90.19
- zustand: ^5.0.10
- socket.io-client: ^4.8.3
- qrcode.react: ^4.2.0
- zod: ^4.3.5
- @ks/shared: workspace:*

**Dev Dependencies:**
- @vitejs/plugin-react: ^5.1.1
- vite: ^7.2.4
- typescript: ~5.9.3
- @types/react: ^19.2.5
- @types/react-dom: ^19.2.3
- @types/node: ^24.10.1
- eslint: ^9.39.1
- typescript-eslint: ^8.46.4

### Shared Package
- Private package with TypeScript types
- Version: 0.0.1

## Module Structure

### Backend Modules
All modules are scaffolded in `apps/backend/src/modules/`:
- **songs/** - Song management module
- **playlists/** - Playlist management module
- **media/** - Media file handling module
- **player/** - Presentation player module
- **settings/** - Application settings module

### Common Directory
- `apps/backend/src/common/` - Shared backend utilities and helpers

## Commands

### Development
```bash
yarn dev              # Run all workspaces in parallel
```

### Build
```bash
yarn build            # Build all workspaces
```

### Lint
```bash
yarn lint             # Lint all workspaces
```

### Individual Workspace Commands
```bash
cd apps/backend && yarn dev     # Backend only
cd apps/frontend && yarn dev    # Frontend only
```

## Notes

- All packages use the latest stable versions as of January 2026
- The project uses Yarn Berry PnP (Plug'n'Play) for faster installs
- Workspace protocol (`workspace:*`) is used for internal dependencies
- Both frontend and backend share the `@ks/shared` package for common types

