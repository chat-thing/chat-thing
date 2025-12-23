import type { ServerWebSocket } from "bun";
import type { AuthContext } from "./auth/requireAuth";
import { db } from "./db/client";
import { messages, users } from "./db/schema";
import { eq } from "drizzle-orm";

interface WebSocketData {
  authContext: AuthContext | null;
  subscribedChannels: Set<number>;
}

interface WebSocketMessage {
  type: string;
  channelId?: number;
  content?: string;
}

// Map of channel ID to set of WebSocket connections
const channelSubscriptions = new Map<number, Set<ServerWebSocket<WebSocketData>>>();

function broadcastToChannel(channelId: number, message: unknown, excludeSocket?: ServerWebSocket<WebSocketData>) {
  const subscribers = channelSubscriptions.get(channelId);
  if (!subscribers) {
    return;
  }

  const messageStr = JSON.stringify(message);
  for (const socket of subscribers) {
    if (socket !== excludeSocket && socket.readyState === 1) {
      socket.send(messageStr);
    }
  }
}

function subscribeToChannel(socket: ServerWebSocket<WebSocketData>, channelId: number) {
  if (!socket.data.subscribedChannels.has(channelId)) {
    socket.data.subscribedChannels.add(channelId);
    
    if (!channelSubscriptions.has(channelId)) {
      channelSubscriptions.set(channelId, new Set());
    }
    channelSubscriptions.get(channelId)!.add(socket);
  }
}

function unsubscribeFromChannel(socket: ServerWebSocket<WebSocketData>, channelId: number) {
  socket.data.subscribedChannels.delete(channelId);
  const subscribers = channelSubscriptions.get(channelId);
  if (subscribers) {
    subscribers.delete(socket);
    if (subscribers.size === 0) {
      channelSubscriptions.delete(channelId);
    }
  }
}

async function handleWebSocketMessage(
  socket: ServerWebSocket<WebSocketData>,
  message: string | Buffer
) {
  let parsed: WebSocketMessage;
  try {
    parsed = JSON.parse(message.toString());
  } catch {
    socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
    return;
  }

  // No runtime auth via message; authentication is established during upgrade
  // and stored on socket.data.authContext

  // All other messages require auth
  if (!socket.data.authContext) {
    socket.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
    socket.close();
    return;
  }

  // Handle subscribe
  if (parsed.type === "subscribe") {
    if (parsed.channelId === undefined) {
      socket.send(JSON.stringify({ type: "error", message: "channelId required" }));
      return;
    }
    subscribeToChannel(socket, parsed.channelId);
    socket.send(JSON.stringify({ type: "subscribed", channelId: parsed.channelId }));
    return;
  }

  // Handle unsubscribe
  if (parsed.type === "unsubscribe") {
    if (parsed.channelId === undefined) {
      socket.send(JSON.stringify({ type: "error", message: "channelId required" }));
      return;
    }
    unsubscribeFromChannel(socket, parsed.channelId);
    socket.send(JSON.stringify({ type: "unsubscribed", channelId: parsed.channelId }));
    return;
  }

  // Handle message creation
  if (parsed.type === "message:create") {
    if (parsed.channelId === undefined || !parsed.content) {
      socket.send(JSON.stringify({ type: "error", message: "channelId and content required" }));
      return;
    }

    // Get user by auth_id
    const user = await db.query.users.findFirst({
      where: eq(users.authId, socket.data.authContext!.userId),
    });

    if (!user) {
      socket.send(JSON.stringify({ type: "error", message: "User not found" }));
      return;
    }

    // Insert message
    const [message] = await db
      .insert(messages)
      .values({
        channelId: parsed.channelId,
        authorUserId: Number(user.userId),
        content: parsed.content,
      })
      .returning();

    const messageData = {
      type: "message:created",
      message: {
        messageId: message.messageId.toString(),
        channelId: message.channelId,
        authorUserId: message.authorUserId.toString(),
        content: message.content,
        createdAt: message.createdAt?.toISOString(),
      },
    };

    // Broadcast to all subscribers of this channel (including sender)
    broadcastToChannel(parsed.channelId, messageData);
    return;
  }

  socket.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
}

// Export WebSocket handlers to be used in main.ts
export const websocketHandlers = {
  message: handleWebSocketMessage,
  open(socket: ServerWebSocket<WebSocketData>) {
    // Preserve authContext set during upgrade; only ensure subscribedChannels exists
    if (!socket.data.subscribedChannels) {
      socket.data.subscribedChannels = new Set();
    }
  },
  close(socket: ServerWebSocket<WebSocketData>) {
    // Unsubscribe from all channels
    for (const channelId of socket.data.subscribedChannels) {
      unsubscribeFromChannel(socket, channelId);
    }
  },
};

