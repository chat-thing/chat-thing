# Chat Thing Monorepo

A monorepo containing the Electron app, Web app, and Backend for the Chat Thing project.

## 📦 Project Structure

```
chat-thing/
├── packages/
│   └── ui/                    # Shared UI component library (shadcn/ui)
├── web-frontend/              # Web application (React + Vite)
├── electron/                  # Electron desktop application (React + Vite)
├── backend/                   # Bun.serve() backend
└── package.json              # Root workspace configuration
```

## 🚀 Getting Started

### Installation

Install all dependencies across the monorepo:

```bash
bun install
```

### Running Applications

```bash
# Run the web frontend
bun run dev:web

# Run the Electron desktop app
bun run dev:electron

# Run the backend
bun run dev:backend
```

## 📚 Packages

### @chat-thing/ui

Shared UI component library based on shadcn/ui. This package contains all reusable UI components that are shared between the Electron and Web apps.

**Location:** `packages/ui/`

**Usage in apps:**

```tsx
import { Button, Card, Input } from "@chat-thing/ui"
```

**Adding new components:**

```bash
cd packages/ui
bunx shadcn@latest add [component-name]
# Then export it in packages/ui/src/index.ts
```

## 🔧 Workspace Configuration

This monorepo uses Bun workspaces. The workspace packages are automatically linked, so changes to `@chat-thing/ui` are immediately available in all consuming applications without needing to rebuild or reinstall.

### Adding the UI package to a new app

In your app's `package.json`:

```json
{
  "dependencies": {
    "@chat-thing/ui": "workspace:*"
  }
}
```

Then run `bun install` from the root directory.

## 📝 Notes

- The `@chat-thing/ui` package uses Tailwind CSS, so consuming apps need Tailwind configured
- React and React DOM are peer dependencies of the UI package
- All shadcn components are exported from the main entry point of `@chat-thing/ui`

## 🛠 Development

### Adding a new workspace package

1. Create a new directory in `packages/` or at the root level
2. Add a `package.json` with a unique name
3. Add the package path to the root `package.json` workspaces array
4. Run `bun install` from the root

### Electron Desktop App

The Electron app is fully configured and ready to use! It's located in the `electron/` directory and uses the same shared UI components.

To run the Electron app:

```bash
cd electron
bun run dev
```

The Electron app will open in a native window with the same UI as the web app. See [ELECTRON_SETUP.md](./ELECTRON_SETUP.md) for more details.

