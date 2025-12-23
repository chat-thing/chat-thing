import { registerRoute, jsonResponse, RouteHandler } from "../index";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

const getMe: RouteHandler = async (request, authContext) => {
  if (!authContext) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // Try to find existing user first
  let user = await db.query.users.findFirst({
    where: eq(users.authId, authContext.userId),
  });

  // If user doesn't exist, create it
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        authId: authContext.userId,
        username: `user_${authContext.userId.slice(0, 8)}`, // Default username
      })
      .returning();
    user = newUser;
  }

  return jsonResponse({
    userId: user.userId.toString(),
    clerkUserId: user.authId,
    username: user.username,
    displayName: user.displayName,
  });
};

export function registerUserRoutes() {
  registerRoute({
    method: "GET",
    path: "/api/users/me",
    handler: getMe,
    requireAuth: true,
  });
}

