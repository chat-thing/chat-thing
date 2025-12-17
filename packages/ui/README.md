# @chat-thing/ui

Shared UI component library based on shadcn/ui for the chat-thing monorepo.

## Usage

This package contains all the shadcn UI components and utilities that are shared between the Electron app and Web app.

### Installation

In your app's directory (web-frontend or electron-app):

```bash
bun add @chat-thing/ui
```

Or add to your package.json:

```json
{
  "dependencies": {
    "@chat-thing/ui": "workspace:*"
  }
}
```

### Import Components

```tsx
import { Button, Card, Input } from "@chat-thing/ui"
```

## Adding New Components

To add new shadcn components to this package:

1. Navigate to this directory: `cd packages/ui`
2. Run shadcn CLI: `bunx shadcn@latest add [component-name]`
3. The component will be added to `src/components/ui/`
4. Export it in `src/index.ts`

