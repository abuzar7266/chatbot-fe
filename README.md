# Next.js Template

A production-ready Next.js template with TypeScript, Tailwind CSS, and best practices for 2026.

## 🚀 Features

- **Next.js 15** - Latest version with App Router
- **React 19** - Latest React version
- **TypeScript** - Full TypeScript support with strict mode
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - Schema validation for environment variables
- **ESLint & Prettier** - Code quality and formatting
- **App Router** - Modern Next.js routing with Server Components
- **Error Handling** - Built-in error and loading states
- **Type Safety** - End-to-end type safety

## 📁 Project Structure

```
nextjs-template/
├── app/                      # App Router directory
│   ├── api/                  # API routes
│   │   └── health/           # Health check endpoint
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles
│   ├── error.tsx             # Error boundary
│   ├── loading.tsx           # Loading UI
│   └── not-found.tsx         # 404 page
├── components/               # React components
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       └── index.ts
├── hooks/                    # Custom React hooks
│   ├── use-debounce.ts
│   ├── use-api.ts
│   ├── use-notification.ts
│   └── index.ts
├── store/                    # Zustand state stores
│   ├── auth-store.ts
│   ├── app-store.ts
│   ├── user-store.ts
│   ├── index.ts
│   └── README.md
├── lib/                      # Library code
│   ├── api/                  # API service
│   │   ├── api-client.ts     # Core API client
│   │   ├── api-definitions.ts # API schemas & endpoints
│   │   ├── user-api.ts       # User API service
│   │   ├── product-api.ts    # Product API service
│   │   └── README.md         # API documentation
│   ├── utils.ts              # Utility functions
│   └── env.ts                # Environment validation
├── types/                    # TypeScript type definitions
│   └── index.ts
├── utils/                    # Helper utilities
│   └── format.ts
├── middleware.ts             # Next.js middleware
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies

```

## 🛠️ Installation

### Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm

### Setup

1. **Navigate to the project**
   ```bash
   cd nextjs-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔧 Configuration

### Environment Variables

Environment variables are validated using Zod. Add your variables to `.env.local`:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

To add more environment variables:

1. Update `lib/env.ts` with your schema
2. Add variables to `.env.local`
3. Access via `env` object (server-side) or `process.env.NEXT_PUBLIC_*` (client-side)

### TypeScript

The project uses strict TypeScript configuration. Path aliases are configured:

- `@/*` - Root directory
- `@/components/*` - Components
- `@/lib/*` - Library code
- `@/hooks/*` - Custom hooks
- `@/utils/*` - Utilities
- `@/types/*` - Type definitions
- `@/app/*` - App directory

### Tailwind CSS

Tailwind is configured with a custom theme. Modify `tailwind.config.ts` to customize.

## 🎨 Components

### UI Components

Reusable UI components are located in `components/ui/`. Example:

```tsx
import { Button } from '@/components/ui';

export default function MyComponent() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```

## 🪝 Custom Hooks

### useDebounce

Debounce a value:

```tsx
import { useDebounce } from '@/hooks';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  // Use debouncedSearch for API calls
}
```

### useNotification

Show notifications:

```tsx
import { useNotification } from '@/hooks';

function MyComponent() {
  const { notify } = useNotification();
  
  const handleClick = () => {
    notify.success('Operation successful!');
  };
}
```

## 🗄️ State Management

Global state management using Zustand.

### Available Stores

- **Auth Store** - Authentication state (persisted)
- **App Store** - Theme, sidebar, notifications
- **User Store** - User data management

### Usage

```tsx
import { useAuthStore, useAppStore } from '@/store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { theme, setTheme } = useAppStore();
  
  // Use state and actions
}
```

See `store/README.md` for complete documentation.

## 📡 API Service

The project includes a centralized API service with type-safe requests and responses.

### Features

- **Type-safe API calls** with Zod schema validation
- **Centralized HTTP methods** (GET, POST, PUT, PATCH, DELETE)
- **Request/Response validation** at runtime
- **Error handling** with detailed error messages
- **Authentication support** with token management

### Usage

```typescript
import { UserApi } from '@/lib/api';

// Get all users
const users = await UserApi.getAll();

// Create user
const newUser = await UserApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
});
```

See `lib/api/README.md` for complete documentation.

### API Routes

API routes are located in `app/api/`. Example endpoints:

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

See `app/api-example` page for interactive examples.

## 🔒 Middleware

Middleware runs on every request. Configure in `middleware.ts`:

- Authentication checks
- Request logging
- Security headers
- Redirects

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy

### Other Platforms

Build the application:

```bash
npm run build
npm run start
```

## 📦 Dependencies

### Core
- `next` - Next.js framework
- `react` - React library
- `react-dom` - React DOM renderer

### Utilities
- `zod` - Schema validation
- `clsx` - Conditional class names
- `tailwind-merge` - Merge Tailwind classes

### Development
- `typescript` - TypeScript compiler
- `eslint` - Linting
- `prettier` - Code formatting
- `tailwindcss` - CSS framework

## 🏗️ Best Practices

1. **Server Components by Default** - Use Server Components unless you need client-side interactivity
2. **Type Safety** - Leverage TypeScript for end-to-end type safety
3. **Component Organization** - Keep components small and focused
4. **Environment Variables** - Always validate with Zod
5. **Error Handling** - Use error boundaries and proper error states
6. **Performance** - Optimize images, use dynamic imports, and leverage Next.js caching

## 📚 Next Steps

1. Add your database integration
2. Set up authentication (NextAuth.js, Clerk, etc.)
3. Add state management if needed (Zustand, Redux, etc.)
4. Configure analytics
5. Set up CI/CD pipeline
6. Add testing (Jest, React Testing Library)

## 📄 License

MIT

---

**Happy Coding! 🚀**

