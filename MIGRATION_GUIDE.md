# Monorepo Refactoring - Migration Guide

## Overview

This document describes the refactoring of the chat-thing project into a proper monorepo structure with shared UI components.

## What Changed

### Before
```
chat-thing/
├── web-frontend/
│   └── src/
│       ├── components/ui/     # shadcn components here
│       └── lib/utils.ts
├── frontend/                   # Electron app (not configured)
└── backend/                    # Bun.serve backend
```

### After
```
chat-thing/
├── packages/
│   └── ui/                     # Shared UI package
│       ├── src/
│       │   ├── components/ui/  # All shadcn components
│       │   ├── lib/utils.ts
│       │   └── index.ts        # Main export file
│       ├── package.json
│       ├── tsconfig.json
│       └── components.json
├── web-frontend/               # Web app (updated to use shared UI)
├── frontend/                   # Electron app (ready for configuration)
└── backend/                    # Bun.serve backend
```

## Changes Made

### 1. Created Shared UI Package (`packages/ui/`)

Created a new package `@chat-thing/ui` containing:
- All shadcn/ui components from `web-frontend/src/components/ui/`
- Utility functions from `web-frontend/src/lib/utils.ts`
- Proper package.json with dependencies
- TypeScript configuration
- Central export file (`src/index.ts`)

### 2. Updated Import Paths

**In `packages/ui/src/components/ui/*.tsx`:**
- Changed `@/lib/utils` → `../../lib/utils`
- Changed `@/components/ui/button` → `./button`
- All components now use relative imports within the package

**In `web-frontend/src/components/*.tsx`:**
- Changed `@/components/ui/*` → `@chat-thing/ui`
- Changed `@/lib/utils` → `@chat-thing/ui`

### 3. Updated Dependencies

**`web-frontend/package.json`:**
- Added: `"@chat-thing/ui": "workspace:*"`
- Removed: UI-specific dependencies (moved to `@chat-thing/ui`)
  - `@base-ui/react`
  - `class-variance-authority`
  - `clsx`
  - `lucide-react`
  - `tailwind-merge`

**`packages/ui/package.json`:**
- Contains all UI-related dependencies
- React and React DOM are peer dependencies

### 4. Workspace Configuration

Created root `package.json` with workspace configuration:
```json
{
  "workspaces": [
    "packages/*",
    "web-frontend"
  ]
}
```

## How to Use the Shared UI Package

### In Existing Apps (web-frontend)

Components are now imported from the shared package:

```tsx
// Before
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// After
import { Button, Card, cn } from "@chat-thing/ui"
```

### In New Apps (Electron, etc.)

1. Add to `package.json`:
```json
{
  "dependencies": {
    "@chat-thing/ui": "workspace:*",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

2. Run `bun install` from the monorepo root

3. Import components:
```tsx
import { Button, Card, Input, cn } from "@chat-thing/ui"
```

4. Make sure your app has Tailwind CSS configured (required for styling)

## Adding New shadcn Components

To add new shadcn components to the shared package:

1. Navigate to the UI package:
```bash
cd packages/ui
```

2. Run the shadcn CLI:
```bash
bunx shadcn@latest add [component-name]
```

3. The component will be added to `src/components/ui/`

4. Export it in `src/index.ts`:
```typescript
export * from "./components/ui/[component-name]"
```

5. Commit and the component will be available in all apps

## Setting Up the Electron App

The `frontend/` directory is ready to be configured as an Electron app. To add it to the workspace:

1. Create `frontend/package.json`:
```json
{
  "name": "electron-app",
  "version": "0.0.0",
  "private": true,
  "dependencies": {
    "@chat-thing/ui": "workspace:*",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "electron": "^latest"
  }
}
```

2. Add `"frontend"` to the root `package.json` workspaces array

3. Run `bun install` from root

4. Configure Electron build and main process

5. Start using shared UI components

## Development Commands

From the monorepo root:

```bash
# Install all dependencies
bun install

# Run web frontend dev server
bun run dev:web

# Run backend dev server
bun run dev:backend

# Install new dependencies to a specific workspace
cd web-frontend && bun add [package-name]
cd packages/ui && bun add [package-name]
```

## Benefits

1. **Single Source of Truth**: UI components defined once, used everywhere
2. **Consistent Design**: All apps use the same component library
3. **Easy Updates**: Update a component once, changes apply to all apps
4. **Better Organization**: Clear separation between apps and shared code
5. **Type Safety**: Full TypeScript support across the monorepo
6. **Faster Development**: Reuse components without copy-paste

## File Removals

The following files were removed from `web-frontend/` (now in `packages/ui/`):
- `src/components/ui/` (entire directory)
- `src/lib/utils.ts`
- `src/lib/` (empty directory)

## Known Issues

The TypeScript compiler shows some errors related to `phosphor` props on lucide-react icons in the example components. These are pre-existing issues in the example code and do not affect the functionality of the refactored structure. They can be fixed by removing the invalid `phosphor` prop from icon components in `web-frontend/src/components/component-example.tsx`.

## Testing

The refactoring has been tested with:
- ✅ ESLint passes with no errors
- ✅ Dev server starts successfully
- ✅ All imports resolve correctly
- ✅ Workspace dependencies installed correctly

## Next Steps

1. Fix TypeScript errors in example components (remove `phosphor` props)
2. Set up Electron app in `frontend/` directory
3. Add more shadcn components as needed
4. Consider adding a shared types package (`@chat-thing/types`)
5. Consider adding a shared utilities package for non-UI code

