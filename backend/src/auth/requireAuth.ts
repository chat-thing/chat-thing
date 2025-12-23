import { auth } from "./betterauth";

export interface AuthContext {
	userId: string;
}

export async function requireAuth(request: Request): Promise<AuthContext> {
	// Try to read the Better Auth session tied to the incoming request (cookie-based)
	// Some Better Auth builds expose a helper for reading session from headers.
	// We pass through the request headers so session cookies are recognized.
	// If session retrieval fails or there's no user, we throw to signal 401.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyAuth = auth as any;
	if (anyAuth?.api?.getSession) {
		const session = await anyAuth.api.getSession({ headers: request.headers });
		if (session?.userId) {
			return { userId: session.userId };
		}
	}

	throw new Error("Unauthorized");
}


