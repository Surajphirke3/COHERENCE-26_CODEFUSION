<div align="center">

<img src="./public/logo.png" alt="Startup Workspace Logo" width="120" height="120" />

# 🚀 Startup Workspace

**The all-in-one productivity platform built for modern startup teams.**  
Manage projects, collaborate in real-time, write docs, and get AI-powered insights — all in one place.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/your-username/startup-workspace/actions)
[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)](https://github.com/your-username/startup-workspace/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://suraj-workspaces.vercel.app)
[![Last Commit](https://img.shields.io/github/last-commit/your-username/startup-workspace?style=flat-square)](https://github.com/your-username/startup-workspace/commits/main)
[![Open Issues](https://img.shields.io/github/issues/your-username/startup-workspace?style=flat-square)](https://github.com/your-username/startup-workspace/issues)

[🌐 Live Demo](https://suraj-workspaces.vercel.app) · [🐛 Report Bug](https://github.com/your-username/startup-workspace/issues/new?template=bug_report.md) · [✨ Request Feature](https://github.com/your-username/startup-workspace/issues/new?template=feature_request.md)

---

<!-- TODO: Replace with a real high-quality animated GIF or screenshot of the app dashboard -->
![Startup Workspace Dashboard](./public/screenshot-dashboard.png)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [API Reference](#-api-reference)
- [Scripts](#-scripts)
- [Database Design](#-database-design)
- [AI Integration](#-ai-integration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author & Acknowledgements](#-author--acknowledgements)

---

## 🔍 Overview

**Startup Workspace** is a full-stack, production-ready SaaS application designed to be the single source of truth for small-to-medium startup teams. Instead of juggling between Trello, Notion, Slack, and ChatGPT — your team gets one unified workspace.

It is built on top of the **Next.js 16 App Router** and leverages **Server Components**, **Route Handlers**, and **Server Actions** to give a seamless, performant experience while keeping the architecture clean and scalable.

**Who is it for?**
- 🏗️ Early-stage startups that need to move fast
- 🧑‍💻 Small engineering teams managing sprints and backlogs
- 📝 Cross-functional teams that write internal documentation
- 💬 Remote-first teams that rely on async messaging

---

## ✨ Features

### 🔐 Authentication & Security
- **Credential-based login** using NextAuth.js with encrypted JWT sessions
- **Route protection** via Next.js Middleware — unauthenticated users are redirected before the page even renders
- Server-side session validation on all protected API routes
- Passwords hashed with `bcrypt` before storage

### 📋 Project & Task Management
- Create and organize projects with custom metadata (status, priority, due dates)
- **Kanban boards** with full drag-and-drop support powered by `@dnd-kit`
- Assign tasks to team members, set deadlines, and track progress visually
- Activity log per project showing who did what and when

### 💬 Real-Time Messaging
- **Direct Messages (DMs)** between team members
- **Group Channels** for project-specific or topic-based communication
- Message history persisted in MongoDB, paginated for performance
- Optimistic UI updates for a snappy, Slack-like experience

### 📄 Collaborative Documentation
- Rich text editor powered by **Tiptap** (built on ProseMirror)
- Support for headings, lists, code blocks, images, and tables
- Documents are linked to specific projects or teams
- Auto-save with debounce to prevent data loss

### 🤖 AI-Powered Features
- **Groq AI SDK** integration for ultra-fast inference
- Ask questions in natural language about your workspace data
- AI can summarize documents, suggest task descriptions, and help with writing
- Streamed responses for a real-time chat experience

### 📊 Dashboard & Analytics
- Unified dashboard showing active projects, pending tasks, recent messages, and activity
- Team-level activity feed for transparency and async-first culture
- Progress indicators and completion rates per project

### 🎨 Modern UI/UX
- Fully responsive layout — works on mobile, tablet, and desktop
- Accessible components following WAI-ARIA standards
- Built with **Tailwind CSS v4** and **Lucide React** icons
- Dark mode ready architecture (toggle implementation ready to extend)
- SWR-powered data fetching with automatic revalidation and stale-while-revalidate caching

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| [Next.js](https://nextjs.org/) | 16.1 | Full-stack React framework (App Router) |
| [React](https://react.dev/) | 19 | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first CSS framework |
| [Zustand](https://zustand-demo.pmnd.rs/) | Latest | Lightweight global state management |
| [SWR](https://swr.vercel.app/) | Latest | Data fetching, caching & revalidation |
| [React Hook Form](https://react-hook-form.com/) | Latest | Performant form state management |
| [Zod](https://zod.dev/) | Latest | TypeScript-first schema validation |
| [Tiptap](https://tiptap.dev/) | Latest | Rich text editor (ProseMirror-based) |
| [@dnd-kit](https://dndkit.com/) | Latest | Accessible drag-and-drop toolkit |
| [Lucide React](https://lucide.dev/) | Latest | Consistent icon library |

### Backend & Database
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | 16.1 | Serverless API endpoints |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Latest | Cloud NoSQL database |
| [Mongoose](https://mongoosejs.com/) | Latest | MongoDB ODM with schema validation |
| [NextAuth.js](https://next-auth.js.org/) | Latest | Authentication & session management |
| [Groq AI SDK](https://groq.com/) | Latest | Fast LLM inference API |

### Developer Experience
| Tool | Purpose |
| :--- | :--- |
| TypeScript | Type safety across the entire codebase |
| ESLint | Code quality and consistency enforcement |
| Prettier | Automatic code formatting |
| tsx | TypeScript execution for scripts (e.g., db seed) |
| Vercel | CI/CD and production hosting platform |

---

## 🏗 Architecture

Startup Workspace follows a **monolithic full-stack architecture** using the Next.js App Router. All frontend and backend code lives in one repository, deployed as serverless functions on Vercel.

```
┌────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                        │
│                                                                │
│   React 19 (RSC + Client Components)  ←→  SWR Data Fetching   │
│                       Zustand (Global State)                   │
└──────────────────────────────┬─────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼─────────────────────────────────┐
│                     NEXT.JS 16 (App Router)                    │
│                                                                │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Server          │  │  Route Handlers  │  │  Middleware  │  │
│  │  Components     │  │  /api/**         │  │  (Auth Gate) │  │
│  └─────────────────┘  └────────┬─────────┘  └──────────────┘  │
│                                │                               │
│  ┌─────────────────────────────▼─────────────────────────┐    │
│  │              Business Logic / Services Layer           │    │
│  │  (Auth, Projects, Tasks, Chats, Docs, AI, Activity)   │    │
│  └──────────────────┬────────────────────┬───────────────┘    │
└─────────────────────┼────────────────────┼────────────────────┘
                      │                    │
          ┌───────────▼───┐       ┌────────▼────────┐
          │  MongoDB Atlas │       │  Groq AI API    │
          │  (Mongoose)   │       │  (LLM Inference) │
          └───────────────┘       └─────────────────┘
```

**Key Architectural Decisions:**
- **Server Components by default** — reduces client-side JavaScript and improves initial load
- **Route Handlers** for REST API — stateless, edge-compatible serverless functions
- **Middleware** for auth — protects routes at the network edge before any server logic runs
- **SWR** for client data — prevents over-fetching, handles loading/error states declaratively
- **Zustand** for UI state — avoids prop drilling without the overhead of Redux

---

## 📁 Project Structure

```text
startup-workspace/
│
├── src/
│   ├── app/                          # Next.js App Router root
│   │   ├── (auth)/                   # Route group: Login, Register pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Route group: Protected app pages
│   │   │   ├── layout.tsx            # Shared dashboard layout (Sidebar, Nav)
│   │   │   ├── page.tsx              # Main dashboard/home
│   │   │   ├── projects/             # Project list and detail pages
│   │   │   ├── tasks/                # Kanban board view
│   │   │   ├── chats/                # Messaging interface
│   │   │   ├── docs/                 # Documentation editor
│   │   │   └── activity/             # Team activity log
│   │   └── api/                      # Backend API Route Handlers
│   │       ├── auth/[...nextauth]/   # NextAuth.js handler
│   │       ├── projects/             # CRUD for projects
│   │       ├── tasks/                # CRUD for tasks
│   │       ├── chats/                # Chat and message endpoints
│   │       ├── docs/                 # Documentation endpoints
│   │       ├── ai/                   # Groq AI interaction endpoint
│   │       └── activity/             # Activity log endpoint
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── ui/                       # Low-level primitives (Button, Input, Modal)
│   │   ├── layout/                   # Sidebar, Navbar, Header
│   │   ├── projects/                 # ProjectCard, ProjectForm, etc.
│   │   ├── tasks/                    # KanbanBoard, TaskCard, TaskForm
│   │   ├── chats/                    # ChatWindow, MessageBubble, etc.
│   │   ├── docs/                     # TiptapEditor, DocCard
│   │   └── ai/                       # AIChat, AIMessageBubble
│   │
│   ├── lib/                          # Core utilities and shared logic
│   │   ├── db.ts                     # MongoDB connection singleton
│   │   ├── auth.ts                   # NextAuth config & options
│   │   ├── models/                   # Mongoose schemas (User, Project, Task, etc.)
│   │   ├── hooks/                    # Custom React hooks (useTasks, useChats, etc.)
│   │   ├── store/                    # Zustand stores
│   │   ├── validators/               # Zod schemas for API input validation
│   │   └── utils.ts                  # General utility functions
│   │
│   └── middleware.ts                 # Route protection logic
│
├── scripts/
│   └── seed.ts                       # Database seeding script
│
├── public/                           # Static assets (images, favicon, fonts)
├── .env.local                        # Local environment variables (not committed)
├── .env.example                      # Environment variable template
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed on your development machine:

| Tool | Minimum Version | Check |
| :--- | :--- | :--- |
| Node.js | v18.17.0+ | `node --version` |
| npm | v9+ | `npm --version` |
| Git | Any recent | `git --version` |
| MongoDB Atlas | Free tier | [Create account](https://cloud.mongodb.com) |

> **Tip:** We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions. Run `nvm use 18` to switch to the correct version.

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/startup-workspace.git
cd startup-workspace
```

**2. Install dependencies**
```bash
npm install
```

**3. Copy the environment variable template**
```bash
cp .env.example .env.local
```

**4. Fill in your environment variables** (see the section below)

**5. Seed the database** with initial mock data (optional but recommended)
```bash
npm run seed
```

---

### Environment Variables

Open `.env.local` and configure the following variables:

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | ✅ | Full MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/startup-workspace` |
| `NEXTAUTH_SECRET` | ✅ | Random secret for encrypting sessions. Generate with: `openssl rand -base64 32` | `abc123xyz...` |
| `NEXTAUTH_URL` | ✅ | Canonical base URL of your app | `http://localhost:3000` |
| `GROQ_API_KEY` | ✅ | API key from [console.groq.com](https://console.groq.com) | `gsk_your_groq_api_key_here` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public-facing URL for client-side use | `http://localhost:3000` |

> ⚠️ Never commit your `.env.local` file. It is already included in `.gitignore`.

**Where to get each key:**
- **`MONGODB_URI`** → [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers → Copy connection string
- **`GROQ_API_KEY`** → [console.groq.com](https://console.groq.com) → API Keys → Create key

---

### Running the Project

**Start the development server** (with hot-reloading):
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

**Build for production:**
```bash
npm run build
```

**Run the production build locally:**
```bash
npm run start
```

**Lint the codebase:**
```bash
npm run lint
```

**Seed the database** with example users, projects, and tasks:
```bash
npm run seed
```
> After seeding, you can log in with the demo credentials printed in the terminal output.

---

## 📡 API Reference

All API routes live under `/api/` and follow RESTful conventions. Every protected route validates the user's session server-side before any operation is performed.

### Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/[...nextauth]` | Login / Logout / Session management | ❌ |

### Projects
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/projects` | Returns all projects for the authenticated user | ✅ |
| `POST` | `/api/projects` | Create a new project | ✅ |
| `GET` | `/api/projects/:id` | Get a single project by ID | ✅ |
| `PATCH` | `/api/projects/:id` | Update project fields | ✅ |
| `DELETE` | `/api/projects/:id` | Soft-delete a project | ✅ |

### Tasks
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/tasks` | Get all tasks (filtered by project/assignee via query params) | ✅ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `PATCH` | `/api/tasks/:id` | Update task (status, assignee, due date, etc.) | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ |

### Chats & Messages
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/chats` | Get all chat threads for the current user | ✅ |
| `POST` | `/api/chats` | Create a new DM or group channel | ✅ |
| `GET` | `/api/chats/:id/messages` | Get paginated message history for a thread | ✅ |
| `POST` | `/api/chats/:id/messages` | Send a new message to a thread | ✅ |

### Documentation
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/docs` | Get all team docs | ✅ |
| `POST` | `/api/docs` | Create a new document | ✅ |
| `GET` | `/api/docs/:id` | Get a single document with content | ✅ |
| `PATCH` | `/api/docs/:id` | Save/update document content | ✅ |
| `DELETE` | `/api/docs/:id` | Delete a document | ✅ |

### AI & Activity
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai` | Send a prompt to Groq AI and get a streamed response | ✅ |
| `GET` | `/api/activity` | Get recent team activity events (paginated) | ✅ |

**Standard Error Responses:**

| Status Code | Meaning |
| :--- | :--- |
| `400` | Bad Request — invalid input or missing required fields |
| `401` | Unauthorized — missing or invalid session |
| `403` | Forbidden — authenticated but not authorized for this resource |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error — something went wrong on the server |

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Next.js development server at `localhost:3000` with hot-reloading |
| `npm run build` | Compile and optimize the app for production |
| `npm run start` | Start a Next.js production server (requires `build` first) |
| `npm run lint` | Run ESLint across the entire codebase and report errors |
| `npm run seed` | Execute `scripts/seed.ts` via `tsx` to populate MongoDB with sample data |

---

## 🗄 Database Design

The application uses **MongoDB Atlas** with **Mongoose** for schema enforcement. Here is an overview of the core collections:

| Collection | Key Fields | Description |
| :--- | :--- | :--- |
| `users` | `name`, `email`, `passwordHash`, `avatar`, `createdAt` | Registered team members |
| `projects` | `title`, `description`, `owner`, `members[]`, `status`, `createdAt` | Workspace projects |
| `tasks` | `title`, `description`, `projectId`, `assignee`, `status`, `priority`, `dueDate` | Kanban task items |
| `chats` | `type` (dm/group), `participants[]`, `name`, `createdAt` | Chat threads |
| `messages` | `chatId`, `sender`, `content`, `createdAt` | Individual chat messages |
| `docs` | `title`, `content` (Tiptap JSON), `projectId`, `author`, `updatedAt` | Rich text documents |
| `activity` | `userId`, `action`, `resourceType`, `resourceId`, `createdAt` | Audit trail events |

**Connection Strategy:**

The MongoDB connection is managed via a **singleton pattern** in `src/lib/db.ts` to prevent multiple connections during hot-reloading in development. In production (serverless), it reuses the existing connection from the module cache.

---

## 🤖 AI Integration

The AI feature uses the **Groq AI SDK** with the `llama3-8b-8192` model (or configurable) to deliver sub-second response times. The integration supports **streaming**, so responses appear token-by-token like ChatGPT.

**How it works:**
1. User submits a prompt through the AI chat UI
2. The frontend sends a `POST` request to `/api/ai` with the message history
3. The Next.js Route Handler creates a Groq streaming completion
4. The response is streamed back using the **Vercel AI SDK** `StreamingTextResponse`
5. The client renders each token as it arrives using the `useChat` hook

**Use cases available in the UI:**
- 📝 Summarize a document in one click
- ✅ Generate task descriptions from a brief idea
- 💬 Ask questions about your project in natural language
- ✍️ Writing assistant inside the doc editor

---

## 🧪 Testing

> **Current Status:** The project uses **ESLint + TypeScript** for static analysis. Automated test suites are planned for a future milestone.

Run static analysis:
```bash
npm run lint
```

**Planned test coverage (contributions welcome!):**

| Layer | Framework | Target |
| :--- | :--- | :--- |
| Unit tests | [Jest](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/) | Utility functions, Zod validators, Mongoose models |
| Component tests | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Form components, modals, UI primitives |
| API integration | [Supertest](https://github.com/ladjs/supertest) | All API Route Handlers |
| E2E tests | [Playwright](https://playwright.dev/) | Auth flow, project creation, task drag-and-drop |

To contribute test coverage, see the [Contributing](#-contributing) section.

---

## ☁️ Deployment

The application is configured for zero-configuration deployment on **Vercel**.

### Deploy to Vercel (Recommended)

1. Fork or clone this repo and push to your GitHub account
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repository
3. Set **Framework Preset** to `Next.js` (auto-detected)
4. Add all required **Environment Variables** in the Vercel dashboard (see [Environment Variables](#environment-variables))
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production `https://` domain
6. Click **Deploy** 🎉

> **MongoDB Atlas Network Access:** In your Atlas dashboard, go to **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`) for Vercel's dynamic IPs, OR use Vercel's [fixed IP add-on](https://vercel.com/docs/security/deployment-protection/methods-to-protect-all-deployments/vercel-authentication) for tighter security.

### Deploy with Docker (Self-hosted)

```dockerfile
# Dockerfile (example)
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json .
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t startup-workspace .
docker run -p 3000:3000 --env-file .env.local startup-workspace
```

---

## 🗺 Roadmap

| Status | Feature |
| :---: | :--- |
| ✅ | Core auth (login/register) |
| ✅ | Project & task management with Kanban |
| ✅ | Direct messaging and group channels |
| ✅ | Rich text documentation editor |
| ✅ | Groq AI assistant |
| ✅ | Team activity log |
| 🔄 | File/image attachments in messages and docs |
| 🔄 | Notifications system (in-app + email) |
| 🔄 | Role-based access control (Admin / Member / Viewer) |
| 🔄 | Calendar and deadline view |
| 🔄 | Dark mode toggle |
| 📅 | Mobile app (React Native / Expo) |
| 📅 | Webhook integrations (GitHub, Slack) |
| 📅 | Billing and subscription management (Stripe) |
| 📅 | Comprehensive test suite (Jest + Playwright) |

---

## 🤝 Contributing

Contributions are what make open-source great. Any contributions you make are **greatly appreciated**.

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/startup-workspace.git
   ```
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and ensure the linter passes:
   ```bash
   npm run lint
   ```
5. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add notification bell component"
   # Other prefixes: fix:, docs:, chore:, refactor:, test:, style:
   ```
6. **Push** to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against the `main` branch of the original repository

### Guidelines
- Keep PRs focused — one feature or fix per PR
- Write clear PR descriptions explaining the *why*, not just the *what*
- If your PR introduces a new dependency, justify it in the description
- Update relevant documentation if you change behavior

### Reporting Bugs
Use the [GitHub Issues](https://github.com/your-username/startup-workspace/issues/new?template=bug_report.md) page with the **bug report** template. Include steps to reproduce, expected vs actual behavior, and your environment details.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

```
MIT License — Copyright (c) 2024 Suraj
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software...
```

---

## 👨‍💻 Author & Acknowledgements

**Suraj**
- 💼 [GitHub](https://github.com/your-github) <!-- TODO: Add real GitHub URL -->
- 🔗 [LinkedIn](https://linkedin.com/in/your-linkedin) <!-- TODO: Add real LinkedIn URL -->
- 🌐 [Portfolio](https://your-portfolio.com) <!-- TODO: Add portfolio URL -->

**Built with & inspired by:**
- [Next.js Documentation](https://nextjs.org/docs) — for the incredible App Router DX
- [Vercel AI SDK](https://sdk.vercel.ai/) — for seamless streaming AI responses
- [Tiptap](https://tiptap.dev/) — for making rich-text editors not painful
- [@dnd-kit](https://dndkit.com/) — for the most accessible drag-and-drop library in the ecosystem
- [shadcn/ui](https://ui.shadcn.com/) — design inspiration and component patterns

---

<div align="center">

If you found this project useful, please consider giving it a ⭐ — it helps more developers discover it!

**[Back to top ↑](#-startup-workspace)**

</div>