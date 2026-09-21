# PROJECT CONTEXT — News Portal (Janta First)

> AI coding tools: ALWAYS read this file before generating code. Follow the tech stack, folder structure, and schemas below EXACTLY. Do not invent new fields, libraries, or patterns. If something is unclear, ASK — do not assume.

## 1. Project Overview
A news portal website inspired by https://omdarpan.com/ (Hindi regional news site).
- Solo developer, using Antigravity for AI-assisted coding.
- Two roles: **Admin** (approves/publishes/manages everything) and **User/Reporter** (submits articles for approval).
- Public site displays only published articles.
- Deployment target: a subdomain (details to be finalized later — do not hardcode domain names).

## 2. Tech Stack (fixed — do not change or suggest alternatives)
- **Frontend:** Next.js (React)
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT-based, with `role` field in token payload
- **Image storage:** Cloudinary (free tier)
- **Hosting (later):** Vercel (frontend) + Render/Railway (backend)

## 3. Folder Structure
```
/backend
  /models       -> Mongoose schemas (User.js, Article.js, Category.js)
  /routes       -> Express routes (auth.js, articles.js, categories.js)
  /controllers  -> Route logic
  /middleware   -> auth.js (JWT verify), role.js (role check)
  /config       -> db.js (MongoDB connection)
  server.js

/frontend
  /pages
    /admin      -> Admin panel pages
    /dashboard  -> User/Reporter panel pages
    /category/[slug].js
    /article/[slug].js
    index.js    -> Homepage
    search.js
  /components   -> Shared UI components
  /lib          -> API helper functions (fetch wrappers)
  /styles
```

## 4. Data Models (exact fields — do not add/remove without asking)

### User
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: "admin" | "reporter"),
  createdAt: Date
}
```

### Category
```
{
  name: String,
  slug: String (unique),
  createdAt: Date
}
```

### Article
```
{
  title: String,
  slug: String (unique),
  content: String (HTML/rich text),
  coverImage: String (Cloudinary URL),
  category: ObjectId (ref: Category),
  tags: [String],
  status: String (enum: "draft" | "pending" | "published" | "rejected"),
  submittedBy: ObjectId (ref: User),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 5. Roles & Permissions

| Action | Admin | Reporter/User |
|---|---|---|
| Register/Login | ✅ | ✅ |
| Create article (status: pending) | ✅ | ✅ |
| Edit own article (if pending/draft) | ✅ | ✅ |
| Edit/delete ANY article | ✅ | ❌ |
| Approve/reject article | ✅ | ❌ |
| Publish/unpublish article | ✅ | ❌ |
| Manage categories | ✅ | ❌ |
| View public site | ✅ | ✅ (public, no login needed) |

## 6. Core Flow
1. User/Reporter logs in → writes article → submits (status becomes `pending`).
2. Admin dashboard shows all `pending` articles.
3. Admin approves (status → `published`, sets `publishedAt`) or rejects (status → `rejected`).
4. Public site only queries/displays articles where `status: "published"`.

## 7. Build Order (follow this sequence, one step at a time)
1. Backend: DB connection + User model + Auth (register/login) with role in JWT
2. Backend: Category model + CRUD routes (admin only)
3. Backend: Article model + CRUD routes with role-based permission middleware
4. Frontend: Admin panel (login, pending articles list, approve/reject, manage categories)
5. Frontend: User/Reporter panel (login, submit article form, "my articles" list)
6. Frontend: Public site (homepage with category sections, category page, article page, search)
7. SEO: meta tags, sitemap.xml, robots.txt, Open Graph tags
8. Deployment: subdomain + CORS + env vars (discussed separately, not yet finalized)

## 8. Rules for AI coding tool (Antigravity)
- Only touch the files relevant to the current task/prompt. Do not refactor unrelated files.
- Do not install new npm packages without explicitly mentioning it first.
- Follow the exact schema field names above — do not rename or add extra fields.
- Do not hardcode the domain/subdomain anywhere — use environment variables (`NEXT_PUBLIC_API_URL`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`).
- If a requirement is ambiguous, stop and ask instead of assuming.
- After generating code for a step, wait for manual verification before moving to the next step.

## 9. Features Explicitly OUT OF SCOPE for MVP (do not build unless asked)
- Live TV embed
- Live cricket widget
- E-paper (PDF viewer)
- Web stories
- Breaking news ticker
- Visitor counter
- Newsletter signup
