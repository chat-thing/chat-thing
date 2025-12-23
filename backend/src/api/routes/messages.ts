import { registerRoute, jsonResponse, parseJsonBody, RouteHandler } from "../index";
import { db } from "../../db/client";
import { messages, users } from "../../db/schema";
import { eq } from "drizzle-orm";

interface CreateMessageBody {
  channelId: number;
  content: string;
}

const createMessage: RouteHandler = async (request, authContext) => {
  if (!authContext) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const body = await parseJsonBody<CreateMessageBody>(request);

  if (!body.channelId || !body.content) {
    return jsonResponse({ error: "channelId and content are required" }, 400);
  }

  // Get user by auth_id
  const user = await db.query.users.findFirst({
    where: eq(users.authId, authContext.userId),
  });

  if (!user) {
    return jsonResponse({ error: "User not found" }, 404);
  }

  // Insert message
  const [message] = await db
    .insert(messages)
    .values({
      channelId: body.channelId,
      authorUserId: Number(user.userId),
      content: body.content,
    })
    .returning();

  return jsonResponse({
    messageId: message.messageId.toString(),
    channelId: message.channelId,
    authorUserId: message.authorUserId.toString(),
    content: message.content,
    createdAt: message.createdAt?.toISOString(),
  });
};

export function registerMessageRoutes() {
  registerRoute({
    method: "POST",
    path: "/api/messages",
    handler: createMessage,
    requireAuth: true,
  });
}

