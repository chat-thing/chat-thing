-- ============================================================
--  USERS: Root account or system
-- ============================================================

CREATE TABLE users (
    user_id           BIGSERIAL PRIMARY KEY,
    user_username     TEXT UNIQUE NOT NULL,
    user_displayname  TEXT,
    user_bio          TEXT,
    user_pronouns     TEXT,
    user_avatar_url   TEXT,
    user_auth_id      TEXT UNIQUE NOT NULL,       -- external auth provider (WorkOS)
    user_is_plural    BOOLEAN DEFAULT FALSE,      -- if true, uses alters as identities
    user_created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(user_auth_id);


-- ============================================================
--  ALTERS: Personas ("members") of a plural user/system
-- ============================================================

CREATE TABLE alters (
    alter_id          BIGSERIAL PRIMARY KEY,
    alter_username    TEXT NOT NULL,
    alter_displayname TEXT,
    alter_bio         TEXT,
    alter_pronouns    TEXT,
    alter_avatar_url  TEXT,
    alter_system_id   BIGINT NOT NULL REFERENCES users(user_id)
                       ON DELETE CASCADE,
    alter_created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alters_system_id ON alters(alter_system_id);


-- ============================================================
--  SERVERS: Discord-style "guilds"
-- ============================================================

CREATE TABLE servers (
    server_id          BIGSERIAL PRIMARY KEY,
    server_name        TEXT NOT NULL,
    server_icon_url    TEXT,
    server_description TEXT,
    server_settings     JSONB DEFAULT '{}'::jsonb,
    server_created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_servers_name_lower ON servers (LOWER(server_name));


-- ============================================================
--  ROLES
-- ============================================================

CREATE TABLE roles (
    role_id           BIGSERIAL PRIMARY KEY,
    role_server_id    BIGINT NOT NULL REFERENCES servers(server_id)
                       ON DELETE CASCADE,
    role_name         TEXT NOT NULL,
    role_permissions  BIGINT DEFAULT 0,  -- bitmask
    role_created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (role_server_id, role_name)
);

CREATE INDEX idx_roles_server ON roles(role_server_id);


-- ============================================================
--  MEMBERS & MEMBER ROLES
-- ============================================================

CREATE TABLE server_members (
    member_user_id    BIGINT NOT NULL REFERENCES users(user_id)
                       ON DELETE CASCADE,
    member_server_id  BIGINT NOT NULL REFERENCES servers(server_id)
                       ON DELETE CASCADE,
    member_nickname   TEXT,
    member_joined_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (member_user_id, member_server_id)
);

CREATE TABLE member_roles (
    member_user_id    BIGINT NOT NULL,
    member_server_id  BIGINT NOT NULL,
    role_id           BIGINT NOT NULL REFERENCES roles(role_id)
                       ON DELETE CASCADE,
    PRIMARY KEY (member_user_id, member_server_id, role_id),
    FOREIGN KEY (member_user_id, member_server_id)
        REFERENCES server_members(member_user_id, member_server_id)
        ON DELETE CASCADE
);


-- ============================================================
--  CATEGORIES
-- ============================================================

CREATE TABLE categories (
    category_id        BIGSERIAL PRIMARY KEY,
    category_name      TEXT NOT NULL,
    category_server_id BIGINT NOT NULL REFERENCES servers(server_id)
                         ON DELETE CASCADE,
    category_created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (category_server_id, category_name)
);

CREATE INDEX idx_categories_server ON categories(category_server_id);


CREATE TABLE category_permissions (
    category_id  BIGINT NOT NULL REFERENCES categories(category_id)
                   ON DELETE CASCADE,
    role_id      BIGINT NOT NULL REFERENCES roles(role_id)
                   ON DELETE CASCADE,
    permissions  BIGINT DEFAULT 0,
    PRIMARY KEY (category_id, role_id)
);


-- ============================================================
--  CHANNELS
-- ============================================================

CREATE TABLE channels (
    channel_id          BIGSERIAL PRIMARY KEY,
    channel_name        TEXT NOT NULL,
    channel_server_id   BIGINT NOT NULL REFERENCES servers(server_id)
                          ON DELETE CASCADE,
    channel_category_id BIGINT REFERENCES categories(category_id),
    channel_topic       TEXT,
    channel_created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (channel_server_id, channel_name)
);

CREATE INDEX idx_channels_server ON channels(channel_server_id);


CREATE TABLE channel_permissions (
    channel_id  BIGINT NOT NULL REFERENCES channels(channel_id)
                   ON DELETE CASCADE,
    role_id     BIGINT NOT NULL REFERENCES roles(role_id)
                   ON DELETE CASCADE,
    permissions BIGINT DEFAULT 0,
    PRIMARY KEY (channel_id, role_id)
);


-- ============================================================
--  MESSAGES
-- ============================================================

CREATE TABLE messages (
    message_id               BIGSERIAL PRIMARY KEY,
    message_channel_id       BIGINT NOT NULL REFERENCES channels(channel_id)
                               ON DELETE CASCADE,
    message_author_user_id   BIGINT NOT NULL REFERENCES users(user_id),
    message_author_alter_id  BIGINT REFERENCES alters(alter_id),
    message_content          TEXT,
    message_has_attachments  BOOLEAN DEFAULT FALSE,
    message_created_at       TIMESTAMPTZ DEFAULT NOW(),
    message_edited_at        TIMESTAMPTZ,
    message_deleted          BOOLEAN DEFAULT FALSE,
    message_deleted_at       TIMESTAMPTZ,
    CHECK (
      -- always at least a user_id
      message_author_user_id IS NOT NULL
    )
);

CREATE INDEX idx_messages_channel ON messages(message_channel_id);
CREATE INDEX idx_messages_created_at ON messages(message_created_at);


-- ============================================================
--  ATTACHMENTS
-- ============================================================

CREATE TABLE attachments (
    attachment_id         BIGSERIAL PRIMARY KEY,
    attachment_message_id BIGINT NOT NULL REFERENCES messages(message_id)
                            ON DELETE CASCADE,
    attachment_url        TEXT NOT NULL,
    attachment_filename   TEXT,
    attachment_mime_type  TEXT,
    attachment_size       BIGINT,
    attachment_created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_message ON attachments(attachment_message_id);