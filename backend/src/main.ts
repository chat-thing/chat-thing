import { handleRequest } from "./api/index";
import { registerHealthRoutes } from "./api/routes/health";
import { registerUserRoutes } from "./api/routes/users";
import { registerMessageRoutes } from "./api/routes/messages";
import { websocketHandlers } from "./socket";

// Register all routes
registerHealthRoutes();
registerUserRoutes();
registerMessageRoutes();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    // Auth routes (Better Auth)
    if (url.pathname.startsWith("/api/auth")) {
      const { auth } = await import("./auth/betterauth");
      return auth.handler(request);
    }

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(request, {
        data: {
          authContext: null,
          subscribedChannels: new Set(),
        },
      });
      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
      return; // Response handled by WebSocket
    }

    // HTTP routes
    return handleRequest(request);
  },
  websocket: websocketHandlers,
});

console.log(`Server running on http://localhost:${port}`);

