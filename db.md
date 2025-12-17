### USERS Table
user_id BIGSERIAL PRIMARY KEY
user_username TEXT UNIQUE NOT NULL
user_displayname TEXT
user_bio TEXT
user_pronouns TEXT
user_avatar_url TEXT
user_auth_id TEXT UNIQUE NOT NULL  -- from WorkOS
user_is_plural BOOLEAN DEFAULT FALSE
user_created_at TIMESTAMP DEFAULT NOW()

### ALTERS Table
alter_id BIGSERIAL PRIMARY KEY
alter_username TEXT NOT NULL
alter_displayname TEXT
alter_bio TEXT
alter_pronouns TEXT
alter_avatar_url TEXT
alter_system_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE
alter_created_at TIMESTAMP DEFAULT NOW()

### SERVERS Table
server_id BIGSERIAL PRIMARY KEY
server_name TEXT NOT NULL
server_icon_url TEXT
server_description TEXT
server_created_at TIMESTAMP DEFAULT NOW()

### SERVER_SETTINGS Table
server_id BIGINT PRIMARY KEY REFERENCES servers(server_id) ON DELETE CASCADE
-- more settings TBD

### ROLES Table
role_id BIGSERIAL PRIMARY KEY
role_server_id BIGINT REFERENCES servers(server_id) ON DELETE CASCADE
role_name TEXT NOT NULL
role_permissions BIGINT DEFAULT 0  -- bitmask style
role_created_at TIMESTAMP DEFAULT NOW()

### CATEGORIES Table
category_id BIGSERIAL PRIMARY KEY
category_name TEXT NOT NULL
category_server_id BIGINT REFERENCES servers(server_id) ON DELETE CASCADE
category_created_at TIMESTAMP DEFAULT NOW()

### CATEGORY_PERMISSIONS Table
category_id BIGINT REFERENCES categories(category_id) ON DELETE CASCADE
role_id BIGINT REFERENCES roles(role_id) ON DELETE CASCADE
-- add granular permission bits here
PRIMARY KEY (category_id, role_id)

### CHANNELS Table
channel_id BIGSERIAL PRIMARY KEY
channel_name TEXT NOT NULL
channel_server_id BIGINT REFERENCES servers(server_id) ON DELETE CASCADE
channel_category_id BIGINT REFERENCES categories(category_id)
channel_created_at TIMESTAMP DEFAULT NOW()

### CHANNEL_PERMISSIONS Table
channel_id BIGINT REFERENCES channels(channel_id) ON DELETE CASCADE
role_id BIGINT REFERENCES roles(role_id) ON DELETE CASCADE
-- add granular permission bits here
PRIMARY KEY (channel_id, role_id)

### MESSAGES Table
message_id BIGSERIAL PRIMARY KEY
message_channel_id BIGINT REFERENCES channels(channel_id) ON DELETE CASCADE
message_author_user_id BIGINT REFERENCES users(user_id)
message_author_alter_id BIGINT REFERENCES alters(alter_id)
message_content TEXT
message_has_attachments BOOLEAN DEFAULT FALSE
message_created_at TIMESTAMP DEFAULT NOW()
message_edited_at TIMESTAMP
message_deleted BOOLEAN DEFAULT FALSE

### ATTACHMENTS Table
attachment_id BIGSERIAL PRIMARY KEY
attachment_message_id BIGINT REFERENCES messages(message_id) ON DELETE CASCADE
attachment_url TEXT NOT NULL
attachment_filename TEXT
attachment_mime_type TEXT
attachment_size INT
attachment_created_at TIMESTAMP DEFAULT NOW()