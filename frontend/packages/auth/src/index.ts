import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: (import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:3000",
	fetchOptions: { credentials: "include" },
});

export const signUp = (email: string, password: string) =>
	authClient.signUp.email({ email, password });

export const signIn = (email: string, password: string) =>
	authClient.signIn.email({ email, password });

export const signOut = () => authClient.signOut();


