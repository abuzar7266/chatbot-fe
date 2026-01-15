# State Management Documentation

Global state management using Zustand - a lightweight, TypeScript-first state management solution.

## Overview

The project uses **Zustand** for global state management, providing:
- **Lightweight** - Minimal boilerplate
- **TypeScript-first** - Full type safety
- **Flexible** - Works with Server and Client Components
- **Persistent** - Optional persistence with localStorage
- **DevTools** - Redux DevTools support

## Store Structure

```
store/
├── auth-store.ts      # Authentication state
├── app-store.ts       # Application-wide state (theme, sidebar, notifications)
├── user-store.ts      # User data state
└── index.ts          # Exports
```

## Available Stores

### 1. Auth Store (`useAuthStore`)

Manages authentication state with persistence.

```typescript
import { useAuthStore } from '@/store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login(userData, token)}>Login</button>
      )}
    </div>
  );
}
```

**State:**
- `user: User | null` - Current user
- `token: string | null` - Auth token
- `isAuthenticated: boolean` - Auth status
- `isLoading: boolean` - Loading state

**Actions:**
- `login(user, token)` - Set user and token
- `logout()` - Clear auth data
- `updateUser(userData)` - Update user info
- `setLoading(loading)` - Set loading state

### 2. App Store (`useAppStore`)

Manages application-wide settings and UI state.

```typescript
import { useAppStore } from '@/store';

function MyComponent() {
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  );
}
```

**State:**
- `theme: 'light' | 'dark' | 'system'` - Theme preference
- `sidebarOpen: boolean` - Sidebar visibility
- `notifications: Notification[]` - Notification queue

**Actions:**
- `setTheme(theme)` - Change theme
- `toggleSidebar()` - Toggle sidebar
- `setSidebarOpen(open)` - Set sidebar state
- `addNotification(notification)` - Add notification
- `removeNotification(id)` - Remove notification
- `clearNotifications()` - Clear all notifications

### 3. User Store (`useUserStore`)

Manages user data with Redux DevTools support.

```typescript
import { useUserStore } from '@/store';

function MyComponent() {
  const { users, isLoading, setUsers, addUser } = useUserStore();

  useEffect(() => {
    // Fetch users and update store
    fetchUsers().then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

**State:**
- `users: User[]` - List of users
- `selectedUser: User | null` - Currently selected user
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

**Actions:**
- `setUsers(users)` - Set users list
- `addUser(user)` - Add new user
- `updateUser(id, data)` - Update user
- `removeUser(id)` - Remove user
- `setSelectedUser(user)` - Select user
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error
- `clearError()` - Clear error

## Hooks

### useNotification

Convenient hook for showing notifications.

```typescript
import { useNotification } from '@/hooks';

function MyComponent() {
  const { notify } = useNotification();

  const handleSuccess = () => {
    notify.success('Operation successful!');
  };

  const handleError = () => {
    notify.error('Something went wrong!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

## Creating New Stores

1. **Create store file** in `store/`:

```typescript
// store/my-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyState {
  data: string[];
  addData: (item: string) => void;
  removeData: (index: number) => void;
}

export const useMyStore = create<MyState>()(
  devtools(
    (set) => ({
      data: [],
      addData: (item) => {
        set((state) => ({
          data: [...state.data, item],
        }));
      },
      removeData: (index) => {
        set((state) => ({
          data: state.data.filter((_, i) => i !== index),
        }));
      },
    }),
    { name: 'my-store' }
  )
);
```

2. **Export from** `store/index.ts`:

```typescript
export { useMyStore } from './my-store';
```

3. **Use in components**:

```typescript
import { useMyStore } from '@/store';

function MyComponent() {
  const { data, addData } = useMyStore();
  // ...
}
```

## Best Practices

1. **Keep stores focused** - One store per domain (auth, app, users, etc.)
2. **Use TypeScript** - Define interfaces for all state
3. **Use DevTools** - Enable for debugging in development
4. **Persist when needed** - Use persist middleware for auth, preferences
5. **Keep actions simple** - Each action should do one thing
6. **Use selectors** - Select only needed state to prevent re-renders

## Selectors (Performance Optimization)

Select only the state you need to prevent unnecessary re-renders:

```typescript
// ❌ Bad - re-renders on any store change
const { user, isAuthenticated, isLoading } = useAuthStore();

// ✅ Good - only re-renders when user changes
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

## Integration with API Service

Combine stores with API calls:

```typescript
import { useUserStore } from '@/store';
import { UserApi } from '@/lib/api';
import { useNotification } from '@/hooks';

function UserList() {
  const { users, setUsers, setLoading, setError } = useUserStore();
  const { notify } = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserApi.getAll();
      setUsers(data);
      notify.success('Users loaded successfully');
    } catch (error) {
      setError(error.message);
      notify.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // ...
}
```

## Persistence

Auth store uses persistence to maintain login state across page refreshes:

```typescript
// Automatically persisted to localStorage
const { user, token } = useAuthStore();
// These persist across page refreshes
```

## DevTools

Install Redux DevTools browser extension to debug state changes in development.

