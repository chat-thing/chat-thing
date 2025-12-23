import { getSessionFromHeaders } from "./betterauth";

export interface AuthContext {
	userId: string;
}

export async function requireAuth(request: Request): Promise<AuthContext> {
	// Read Better Auth session from request headers (cookie-based)
	const session = await getSessionFromHeaders(request.headers);
	if (session?.userId) return { userId: session.userId };

	throw new Error("Unauthorized");
}


