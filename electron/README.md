# Chat Thing - Electron App

Desktop application for Chat Thing built with Electron + React + Vite.

## Features

- ⚡️ Electron + React + Vite
- 🎨 Shared UI components from `@chat-thing/ui`
- 🎨 Tailwind CSS v4
- 🧩 shadcn/ui components
- 📦 TypeScript

## Development

```bash
# Install dependencies (from monorepo root)
bun install

# Run in development mode
cd electron
bun run dev

# Build for production
bun run build
```

## Project Structure

```
electron/
├── electron/           # Electron main process
│   ├── main.ts        # Main process entry
│   └── preload.ts     # Preload script
├── src/               # React app (renderer process)
│   ├── components/    # App components
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # React entry point
│   └── index.css      # Tailwind styles
├── public/            # Static assets
└── index.html         # HTML template
```

## Using Shared UI Components

All shadcn UI components are available from the shared package:

```tsx
import { Button, Card, Input } from "@chat-thing/ui"

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Type here..." />
      <Button>Submit</Button>
    </Card>
  )
}
```

## Building

The build process creates:
- `dist/` - Bundled renderer process (React app)
- `dist-electron/` - Compiled main process
- `dist-app/` - Final packaged application

## Scripts

- `bun run dev` - Start Vite dev server
- `bun run electron:dev` - Start Vite + Electron in dev mode
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
