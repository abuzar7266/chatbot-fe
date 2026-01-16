# Chatbot Frontend (Next.js + TypeScript)

Production-ready frontend for a ChatGPT-style assistant. It provides:
- Email/password authentication with profile fetching
- Multi-chat workspace with streaming AI responses
- Simple markdown-style rendering for assistant messages
- Global state management with Zustand
- Typed, validated API layer using Zod

The app is built on the **Next.js App Router** with **TypeScript**, **Tailwind CSS**, and **Zustand**.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **State Management**: Zustand
- **Validation**: Zod
- **Linting/Formatting**: ESLint (`next/core-web-vitals`, `@typescript-eslint`) + Prettier

---

## Project Structure

```text
app/                    # Next.js App Router entrypoints
  (auth)/               # Auth layout and pages
    layout.tsx          # Auth shell (marketing copy + centered card)
    login/page.tsx      # Login form and auth flow
    signup/page.tsx     # Signup form and verification flow
    verify-email/page.tsx
  api/health/route.ts   # Frontend health check route
  chat/                 # Chat workspace (root + dynamic [id] route)
  layout.tsx            # Root layout, providers, global shells
  page.tsx              # Landing page / initial route
  error.tsx             # Global error boundary UI
  loading.tsx           # Root-level loading UI
  not-found.tsx         # 404 page

components/
  chat-sidebar.tsx      # Sidebar with chat list and profile / logout UI
  notifications/
    notification-toast.tsx
  providers/
    store-provider.tsx  # Hydrates theme + auth token into app
  ui/                   # Reusable primitive components (button, card, input, etc.)

hooks/
  use-api.ts            # Generic API execution hook (loading + error)
  use-debounce.ts       # Debounce utility hook
  use-notification.ts   # Notification helper built on app store

lib/
  api/                  # Typed API clients and schemas
    api-client.ts       # Core HTTP client + Zod validation
    api-definitions.ts  # Shared API type definitions
    auth-api.ts         # Auth endpoints + password encryption
    chat-api.ts         # Chat and streaming endpoints
    health-api.ts       # Health endpoint
    index.ts            # Barrel export
    README.md           # API-layer specific documentation
  chat-utils.ts         # Markdown parsing, titles, timestamps
  chat-static-content.ts# Static steps / questions content
  env.ts                # Runtime environment variable validation
  utils.ts              # Generic utilities

store/
  app-store.ts          # Theme, sidebar, notifications
  auth-store.ts         # Auth token + user profile state
  chat-store.ts         # Chats, messages, loading flags
  index.ts              # Barrel export for all stores
  README.md             # State management documentation

types/
  index.ts              # Shared type definitions

utils/
  format.ts             # Formatting helpers

public/assets/          # Logos and icons

Config / tooling:
- `next.config.ts`      # Next.js configuration
- `tsconfig.json`       # TypeScript configuration and path aliases
- `.eslintrc.json`      # ESLint configuration
- `.prettierrc`         # Prettier configuration
- `tailwind.config.ts`  # Tailwind configuration
- `.env.example`        # Example environment variables
- `api-specs.json`      # Backend OpenAPI specification (for reference)

---

## High-Level Architecture

The app is structured around three main concerns:

1. **Routing & UI composition** (App Router under `app/`)
2. **State management** (Zustand stores under `store/`)
3. **API access** (typed clients in `lib/api/`)

### Routing and Layouts (`app/`)

- Uses the Next.js **App Router**.
- Auth pages are grouped under the `(auth)` segment with a shared layout.
- Chat pages live under `/chat`:
  - `/chat` selects or creates a default chat.
  - `/chat/[id]` shows a specific conversation.
- Global layouts:
  - `app/layout.tsx` wraps the entire app with HTML `<body>`, fonts, and the `StoreProvider`.
  - `app/(auth)/layout.tsx` provides a marketing-style shell around auth forms.

### State Management (Zustand)

All global state is colocated in `store/` and accessed via hooks:

- **Auth Store** (`useAuthStore` in `auth-store.ts`)
  - State: `user`, `token`, `isAuthenticated`, `isLoading`
  - Actions: `login`, `logout`, `setLoading`, `updateUser`
  - Uses `zustand/persist` to store auth details in `localStorage`.
  - Keeps the shared `apiClient` in sync with the current token.

- **App Store** (`useAppStore` in `app-store.ts`)
  - State: `theme`, `sidebarOpen`, `notifications[]`
  - Actions: `setTheme`, `toggleSidebar`, `setSidebarOpen`, `addNotification`, `removeNotification`, `clearNotifications`
  - Applies dark/light/system theme by toggling classes on `document.documentElement`.
  - Manages notifications and automatically clears them after 5 seconds.

- **Chat Store** (`useChatStore` in `chat-store.ts`)
  - State: list of `chats`, plus `isInitialLoading`
  - Each `Chat` includes: `id`, `title`, `mode` (`'doc' | 'empty'`), `messages`, paging and loading flags.
  - Actions: `setChats` (functional or array update) and `setIsInitialLoading`.
  - Used heavily by `app/chat/page.tsx` to drive the workspace UI.

### API Layer (`lib/api/`)

The API layer is built around a single `ApiClient`:

- `api-client.ts`:
  - Holds a `baseURL` (typically `NEXT_PUBLIC_APP_URL`).
  - Exposes `get`, `post`, `put`, `patch`, `delete`.
  - Supports optional Zod request/response schemas for runtime validation.
  - Throws structured `ApiError` objects on non-2xx responses.
  - Manages an `Authorization` header via `setAuthToken` / `clearAuthToken`.

- `auth-api.ts`:
  - Defines Zod schemas for auth requests/responses.
  - `signUp` / `signIn`:
    - Encrypts password using a simple XOR + base64 scheme and a constant key from env.
    - Sends the encrypted password to the backend.
    - On successful sign-in, sets the access token on the `apiClient`.
  - `verifyEmail`, `getProfile`, `updateProfile`, `syncSupabaseUser`:
    - Mirror backend endpoints and return parsed, typed data.

- `chat-api.ts`:
  - `listChats`, `createChat`, `getChat`:
    - Wrap chat CRUD endpoints and map to Zod schemas.
  - `listMessages`:
    - Paginates chat messages; supports filters via query params.
  - `streamChat`:
    - Uses native `fetch` and `ReadableStream` APIs to consume a server-sent event (SSE) stream (`text/event-stream`).
    - Parses `data:` lines, validates them via Zod, and forwards chunks to a callback.

- `health-api.ts`:
  - Lightweight wrapper around the backend health endpoint.

The API contract is documented in `api-specs.json` (OpenAPI 3), which describes auth, chats, messages, and streaming endpoints.

### Chat Workspace (`app/chat`)

The main chat experience is handled in `app/chat/page.tsx`:

- Uses `useChatStore` to:
  - Load the list of chats on first render.
  - Determine an initial chat (`"New chat"` without messages or a newly created one).
  - Lazy-load messages per chat with pagination.
- Uses `ChatApi` methods to:
  - Fetch chats and messages.
  - Create chats on demand.
  - Stream assistant responses via `streamChat`.
- Renders:
  - Chat sidebar with chat list and profile summary.
  - Main content area with tabs:
    - **Output**: Conversation messages + streaming responses.
    - **Steps**: Static instructions content.
    - **Questions**: Useful prompt ideas.

#### Streaming and "Thinking" Loader

- When the user sends a message:
  - It is appended optimistically to the current chat.
  - The app sets an `isThinking` flag and shows an “AI …” loader with animated dots.
  - A random delay (2–5 seconds) is applied before starting the stream, to show a “thinking” phase.
  - After the delay, `ChatApi.streamChat` starts and incoming chunks progressively build the assistant message.
  - When the stream finishes, the chat title is updated based on the response.

#### Markdown Parsing

- Assistant messages are rendered via `parseMarkdownSections` in `lib/chat-utils.ts`:
  - Supports `## Heading` for section titles.
  - Supports `-`-prefixed bullet lists.
  - Groups contiguous lines into paragraphs.
  - Falls back to plain text if no markdown sections are detected.

---

## Coding Standards

### General

- **Language**: TypeScript everywhere (no `.js` in source).
- **Strictness**: `strict: true` in `tsconfig.json`.
- **Imports**:
  - Prefer path aliases from `tsconfig.json` (e.g. `@/lib/api`, `@/store`) instead of long relative paths.

### Naming Conventions

- **Files and folders**:
  - React components: `PascalCase` (`ChatSidebar.tsx`, `StoreProvider.tsx`) or domain-based (`chat-sidebar.tsx`) as already used.
  - Hooks: `useName.ts` (e.g. `use-api.ts`, `use-notification.ts`).
  - Stores: `domain-store.ts` (e.g. `auth-store.ts`, `chat-store.ts`).
  - Utility modules: `kebab-case` (`chat-utils.ts`, `env.ts`).

- **Types and interfaces**:
  - Use `PascalCase` (`Chat`, `ChatMessage`, `ApiClient`, `AuthState`).
  - Export shared types from `types/index.ts` when cross-cutting.

- **State hooks**:
  - `const [value, setValue] = useState(...)`
  - Selector-based access for Zustand: `useAuthStore(state => state.isAuthenticated)`.

- **Components**:
  - `function ComponentName(props: Props) { ... }`
  - Props types named `<ComponentName>Props`.

### Styles and Formatting

- Enforced by:
  - `.eslintrc.json` with:
    - `next/core-web-vitals`
    - `@typescript-eslint` rules such as `no-unused-vars`, `no-explicit-any` (as warnings)
  - `.prettierrc`:
    - `singleQuote: true`
    - `printWidth: 100`
    - `semi: true`
    - `tabWidth: 2`
- Tailwind CSS utilities are used directly in `className` strings.

### React / Next.js Patterns

- Use **Client Components** (`'use client'`) when using stateful hooks or browser APIs.
- Data fetching on the client is done via:
  - `ChatApi` / `AuthApi` in Client Components.
  - `useApi` when you want built-in loading/error state.
- Keep side effects in `useEffect` hooks with precise dependency arrays.

### Store and Hooks Best Practices

- Keep stores focused on a single domain (`auth`, `app`, `chat`).
- Expose both **state** and **actions** from each store.
- Prefer selector usage for performance:
  - `const isAuthenticated = useAuthStore(state => state.isAuthenticated);`
- Notifications:
  - Use `useNotification()` rather than interacting with `useAppStore` directly in components.

---

## Environment Variables

All environment variables should be managed via `.env` / `.env.local` and validated via `lib/env.ts`.

Required/used variables:

- `NODE_ENV`  
  Standard Node environment (`development`, `production`, `test`).

- `NEXT_PUBLIC_APP_URL`  
  Base URL for API calls. Typically points to your backend base URL (e.g. `http://localhost:3000/api` or a deployed API).

- `NEXT_PUBLIC_PASSWORD_ENCRYPTION_KEY` (or `PASSWORD_ENCRYPTION_KEY`)  
  Constant key used for client-side password obfuscation (XOR + base64) before sending to the backend.  
  Both frontend and backend must agree on the same key and algorithm.

See `.env.example` for a starting point and always avoid committing real secrets.

---

## Setup and Installation

### 1. Prerequisites

- Node.js (LTS version recommended)
- npm (ships with Node)

### 2. Install Dependencies

From the project root:

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then set:

- `NEXT_PUBLIC_APP_URL` to your backend API base URL.
- `NEXT_PUBLIC_PASSWORD_ENCRYPTION_KEY` to the agreed encryption key.

### 4. Run the Development Server

```bash
npm run dev
```

The app will typically run at `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npm start
```

This runs a production build and then starts the Next.js server.

---

## Scripts

Defined in `package.json`:

- `npm run dev`  
  Start the development server.

- `npm run build`  
  Create an optimized production build.

- `npm run start`  
  Run the production server (after `build`).

- `npm run lint`  
  Run ESLint using Next.js config (Core Web Vitals).

- `npm run type-check`  
  Run TypeScript type checking (`tsc --noEmit`).

- `npm run format` / `npm run format:check`  
  Apply or verify Prettier formatting.

---

## Feature Overview

### Authentication

- Email/password login and signup pages under `/login` and `/signup`.
- Passwords are **obfuscated on the client** using XOR + base64 with a constant key.
- After sign-in:
  - Access token is stored in the auth store and in `apiClient`.
  - User profile is fetched (`AuthApi.getProfile`) to get full name.
  - Auth state is persisted in local storage for subsequent sessions.

### Email Verification

- `verify-email/page.tsx` uses `AuthApi.verifyEmail` to confirm email.
- Reads query parameters (token, type, etc.) from the URL.
- Displays a confirmation or error message to the user.

### Chat Experience

- Multi-chat sidebar:
  - Lists chats retrieved from the backend.
  - Creates or reuses a “New chat” that has no messages.
- Conversation area:
  - Displays user messages right-aligned, assistant messages left-aligned.
  - Assistant messages render parsed markdown sections (headings, bullets, paragraphs).
  - Timestamps are displayed using formatted local date/time.
- Streaming:
  - Uses SSE endpoint `/chats/{id}/messages/stream`.
  - Each `StreamChunk` gradually builds the assistant message content.

### Notifications

- Powered by `useAppStore` + `useNotification` hook.
- Notification toast component renders queued notifications.
- Types: `success`, `error`, `warning`, `info`.
- Notifications auto-dismiss after 5 seconds.

### Theming

- Theme state is stored in `useAppStore`.
- Supported values: `light`, `dark`, `system`.
- `StoreProvider`:
  - Applies the theme on first render.
  - Listens to system theme changes when `theme === 'system'`.

---

## Extending the Project

### Adding a New API Module

1. Define Zod schemas and types in a new file under `lib/api/` (e.g. `my-api.ts`).
2. Use `apiClient` helpers (`get`, `post`, etc.) with schemas.
3. Export your API from `lib/api/index.ts`.
4. Consume it in components or hooks via:
   - direct calls, or
   - the `useApi` hook for loading/error handling.

### Adding a New Store

1. Create `store/my-store.ts` and define your Zustand store.
2. Export it from `store/index.ts`.
3. Use it in components via `import { useMyStore } from '@/store';`.

### Adding New Screens / Routes

- Create a new folder under `app/` (e.g. `app/settings/page.tsx`).
- Decide if it should be a Client or Server Component:
  - Use `'use client';` at the top if you need hooks or browser APIs.
- Reuse primitives from `components/ui` to keep UI consistent.

---

## Notes

- This frontend expects a backend that matches `api-specs.json`.
- Any changes to the backend contract should be reflected in:
  - `lib/api/*` Zod schemas and types.
  - UI components that rely on those types.

