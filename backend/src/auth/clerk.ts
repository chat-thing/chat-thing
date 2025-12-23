import { verifyToken } from "@clerk/backend";

const CLERK_JWT_KEY = process.env.CLERK_JWT_KEY;
const CLERK_AUTHORIZED_PARTIES = process.env.CLERK_AUTHORIZED_PARTIES?.split(",").filter(Boolean);

export interface AuthContext {
  clerkUserId: string;
}

export async function verifyAuthToken(token: string): Promise<AuthContext | null> {
  if (!CLERK_JWT_KEY) {
    throw new Error("CLERK_JWT_KEY environment variable is required");
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: CLERK_JWT_KEY,
      authorizedParties: CLERK_AUTHORIZED_PARTIES,
    });

    if (!payload.sub) {
      return null;
    }

    return {
      clerkUserId: payload.sub,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);
  const auth = await verifyAuthToken(token);
  if (!auth) {
    throw new Error("Invalid or expired token");
  }

  return auth;
}

