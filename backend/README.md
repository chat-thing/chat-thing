# Backend

Bun-based backend server with PostgreSQL, Drizzle ORM, Clerk authentication, and WebSocket support.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Create a `.env` file with the following variables:
   ```bash
   # Database
   DATABASE_URL=postgres://user:password@localhost:5432/chat_thing
   
   # Clerk Authentication
   CLERK_JWT_KEY=your_clerk_jwt_verification_key_here
   CLERK_AUTHORIZED_PARTIES=your_app_id_1,your_app_id_2
   
   # Server
   PORT=3000
   ```

3. Set up your PostgreSQL database and update `DATABASE_URL` in `.env`.

4. Generate and run migrations:
   ```bash
   bun run db:generate
   bun run db:push
   ```

   Or use migrations:
   ```bash
   bun run db:migrate
   ```

## Development

Start the development server:
```bash
bun run dev
```

The server will run on `http://localhost:3000` (or the port specified in `PORT`).

## API Routes

- `GET /health` - Health check endpoint
- `GET /api/users/me` - Get current user (requires auth)
- `POST /api/messages` - Create a message (requires auth)
  ```json
  {
    "channelId": 1,
    "content": "Hello, world!"
  }
  ```

## WebSocket

Connect to `ws://localhost:3000/ws` and send JSON messages:

1. **Authenticate** (first message required):
   ```json
   {
     "type": "auth",
     "token": "<clerk_jwt_token>"
   }
   ```

2. **Subscribe to channel**:
   ```json
   {
     "type": "subscribe",
     "channelId": 1
   }
   ```

3. **Create message**:
   ```json
   {
     "type": "message:create",
     "channelId": 1,
     "content": "Hello!"
   }
   ```

4. **Unsubscribe from channel**:
   ```json
   {
     "type": "unsubscribe",
     "channelId": 1
   }
   ```

Server will broadcast `message:created` events to all subscribers of a channel when a message is created.

## Database Commands

- `bun run db:generate` - Generate migration files
- `bun run db:push` - Push schema changes directly to database
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio (database GUI)

