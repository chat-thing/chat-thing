import { registerRoute, jsonResponse, RouteHandler } from "../index";

const healthCheck: RouteHandler = async () => {
  return jsonResponse({ ok: true });
};

export function registerHealthRoutes() {
  registerRoute({
    method: "GET",
    path: "/health",
    handler: healthCheck,
    requireAuth: false,
  });
}

