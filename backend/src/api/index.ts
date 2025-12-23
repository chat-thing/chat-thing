import type { AuthContext } from "../auth/requireAuth";

export type RouteHandler = (request: Request, context: AuthContext | null) => Promise<Response>;

export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  requireAuth: boolean;
}

const routes: Route[] = [];

export function registerRoute(route: Route) {
  routes.push(route);
}

function matchRoute(pathname: string, routePath: string): Record<string, string> | null {
  const routeParts = routePath.split("/");
  const pathParts = pathname.split("/").filter(Boolean);

  if (routeParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const pathPart = pathParts[i];

    if (routePart.startsWith(":")) {
      params[routePart.slice(1)] = pathPart;
    } else if (routePart !== pathPart) {
      return null;
    }
  }

  return params;
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // CORS handling
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Find matching route
  for (const route of routes) {
    if (route.method !== request.method) {
      continue;
    }

    const params = matchRoute(pathname, route.path);
    if (params === null) {
      continue;
    }

    // Add params to request URL for handler access
    const urlWithParams = new URL(request.url);
    Object.entries(params).forEach(([key, value]) => {
      urlWithParams.searchParams.set(key, value);
    });

    const requestWithParams = new Request(urlWithParams, request);

    let authContext: AuthContext | null = null;
    if (route.requireAuth) {
      try {
        const { requireAuth } = await import("../auth/requireAuth");
        authContext = await requireAuth(requestWithParams);
      } catch (error) {
        return jsonResponse({ error: error instanceof Error ? error.message : "Unauthorized" }, 401);
      }
    }

    try {
      const response = await route.handler(requestWithParams, authContext);
      // Add CORS headers to response
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("Route handler error:", error);
      return jsonResponse(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) {
    throw new Error("Request body is empty");
  }
  return JSON.parse(text) as T;
}

