### **Project: “Discord but Plurality‑Friendly”**

#### **Frontend**

- **Framework:** React
- **Routing:** Wouter (using hash routing for Electron)
- **Styling:** SCSS with Tailwind base primitives
- **Auth:** Clerk
- **Bundler/Dev Server:** Vite
- **Package Manager:** Bun
- **Desktop Build:** Electron (React served locally via `index.html#/…`)
- **Frontend Hosting (web version):** Netlify

---

#### **Backend**

- **Runtime:** Node.js (via Bun)
- **Framework:** **Express**
- **API Layer:** **GraphQL** (Apollo Server or Yoga)
- **Real‑time:** WebSockets (`graphql-ws` for GraphQL Subscriptions)
- **Auth Integration:** Clerk SDK → JWT/session middleware
- **DB:** Postgres
- **DB Host:** **Railway**
- **Backend Hosting:** **Railway**

---

#### **Extra Shape**

- **Frontend Routing Mode:** hash (so refreshes work in Electron)
- **Dev Tooling:**

  - Prettier & ESLint
  - npm scripts via Bun (`bun dev`, `bun build`, `bun start`)
