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


