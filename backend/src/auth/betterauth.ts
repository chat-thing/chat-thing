import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";

export const auth = betterAuth({
	// Base URL used for callbacks and absolute links
	baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	secret: process.env.BETTER_AUTH_SECRET!,
	database: drizzleAdapter(db, { provider: "pg" }),
	features: {
		emailAndPassword: { enabled: true },
	},
	routes: {
		prefix: "/api/auth",
	},
});

// Wrapper: get session from request headers (typed outward, internal API may vary)
export async function getSessionFromHeaders(
	headers: Headers,
): Promise<{ userId?: string } | null> {
	type BetterAuthApi = {
		api?: {
			getSession: (args: { headers: Headers }) => Promise<{ userId?: string } | null>;
		};
	};
	const api = (auth as unknown as BetterAuthApi).api;
	if (api?.getSession) {
		return api.getSession({ headers });
	}
	return null;
}


