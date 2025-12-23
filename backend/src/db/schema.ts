import { pgTable, bigserial, text, boolean, timestamp, bigint, jsonb, uniqueIndex, index, check } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  userId: bigserial("user_id", { mode: "bigint" }).primaryKey(),
  username: text("user_username").notNull().unique(),
  displayName: text("user_displayname"),
  bio: text("user_bio"),
  pronouns: text("user_pronouns"),
  avatarUrl: text("user_avatar_url"),
  authId: text("user_auth_id").notNull().unique(), // Auth provider user ID (Better Auth)
  isPlural: boolean("user_is_plural").default(false),
  createdAt: timestamp("user_created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  authIdIdx: index("idx_users_auth_id").on(table.authId),
}));

// Servers table
export const servers = pgTable("servers", {
  serverId: bigserial("server_id", { mode: "bigint" }).primaryKey(),
  name: text("server_name").notNull(),
  iconUrl: text("server_icon_url"),
  description: text("server_description"),
  settings: jsonb("server_settings").default({}),
  createdAt: timestamp("server_created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  nameLowerIdx: uniqueIndex("idx_servers_name_lower").on(table.name),
}));

// Categories table (needed for channels)
export const categories = pgTable("categories", {
  categoryId: bigserial("category_id", { mode: "bigint" }).primaryKey(),
  name: text("category_name").notNull(),
  serverId: bigint("category_server_id", { mode: "number" }).notNull().references(() => servers.serverId, { onDelete: "cascade" }),
  createdAt: timestamp("category_created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  serverIdx: index("idx_categories_server").on(table.serverId),
  serverNameUnique: uniqueIndex("idx_categories_server_name").on(table.serverId, table.name),
}));

// Channels table
export const channels = pgTable("channels", {
  channelId: bigserial("channel_id", { mode: "bigint" }).primaryKey(),
  name: text("channel_name").notNull(),
  serverId: bigint("channel_server_id", { mode: "number" }).notNull().references(() => servers.serverId, { onDelete: "cascade" }),
  categoryId: bigint("channel_category_id", { mode: "number" }).references(() => categories.categoryId),
  topic: text("channel_topic"),
  createdAt: timestamp("channel_created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  serverIdx: index("idx_channels_server").on(table.serverId),
  serverNameUnique: uniqueIndex("idx_channels_server_name").on(table.serverId, table.name),
}));

// Alters table (needed for messages)
export const alters = pgTable("alters", {
  alterId: bigserial("alter_id", { mode: "bigint" }).primaryKey(),
  username: text("alter_username").notNull(),
  displayName: text("alter_displayname"),
  bio: text("alter_bio"),
  pronouns: text("alter_pronouns"),
  avatarUrl: text("alter_avatar_url"),
  systemId: bigint("alter_system_id", { mode: "number" }).notNull().references(() => users.userId, { onDelete: "cascade" }),
  createdAt: timestamp("alter_created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  systemIdx: index("idx_alters_system_id").on(table.systemId),
}));

// Messages table
export const messages = pgTable("messages", {
  messageId: bigserial("message_id", { mode: "bigint" }).primaryKey(),
  channelId: bigint("message_channel_id", { mode: "number" }).notNull().references(() => channels.channelId, { onDelete: "cascade" }),
  authorUserId: bigint("message_author_user_id", { mode: "number" }).notNull().references(() => users.userId),
  authorAlterId: bigint("message_author_alter_id", { mode: "number" }).references(() => alters.alterId),
  content: text("message_content"),
  hasAttachments: boolean("message_has_attachments").default(false),
  createdAt: timestamp("message_created_at", { withTimezone: true }).defaultNow(),
  editedAt: timestamp("message_edited_at", { withTimezone: true }),
  deleted: boolean("message_deleted").default(false),
  deletedAt: timestamp("message_deleted_at", { withTimezone: true }),
}, (table) => ({
  channelIdx: index("idx_messages_channel").on(table.channelId),
  createdAtIdx: index("idx_messages_created_at").on(table.createdAt),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;

