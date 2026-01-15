# API Service Documentation

Centralized API service with type-safe requests and responses using Zod schemas.

## Overview

The API service provides:
- **Type-safe API calls** with Zod schema validation
- **Centralized HTTP methods** (GET, POST, PUT, PATCH, DELETE)
- **Request/Response validation** at runtime
- **Error handling** with detailed error messages
- **Authentication support** with token management

## Structure

```
lib/api/
├── api-client.ts          # Core API client class
├── api-definitions.ts     # API schemas and endpoints
├── user-api.ts           # User API service
├── product-api.ts        # Product API service
└── index.ts              # Exports
```

## Usage

### Basic API Client Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const users = await apiClient.get('/api/users');

// POST request
const newUser = await apiClient.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com',
}, {
  requestSchema: createUserSchema,
  responseSchema: userSchema,
});

// PUT request
const updatedUser = await apiClient.put(`/api/users/${id}`, {
  name: 'Jane Doe',
}, {
  requestSchema: updateUserSchema,
  responseSchema: userSchema,
});

// PATCH request
const patchedUser = await apiClient.patch(`/api/users/${id}`, {
  email: 'newemail@example.com',
});

// DELETE request
await apiClient.delete(`/api/users/${id}`);
```

### Using API Services

```typescript
import { UserApi, ProductApi } from '@/lib/api';

// Get all users
const users = await UserApi.getAll();

// Get user by ID
const user = await UserApi.getById('123');

// Create user
const newUser = await UserApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
});

// Update user
const updated = await UserApi.update('123', {
  name: 'Jane Doe',
});

// Delete user
await UserApi.delete('123');
```

### Using with React Hook

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { UserApi } from '@/lib/api';

export default function MyComponent() {
  const { execute, loading, error } = useApi();

  const handleFetchUsers = async () => {
    const users = await execute(() => UserApi.getAll(), {
      onSuccess: (data) => console.log('Users loaded:', data),
      onError: (err) => console.error('Error:', err),
    });
  };

  return (
    <div>
      <button onClick={handleFetchUsers} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Users'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Authentication

```typescript
import { apiClient } from '@/lib/api';

// Set authentication token
apiClient.setAuthToken('your-jwt-token');

// Clear token
apiClient.clearAuthToken();

// Set custom headers
apiClient.setDefaultHeaders({
  'X-Custom-Header': 'value',
});
```

## Creating New API Services

1. **Define schemas** in `api-definitions.ts`:

```typescript
export const ApiSchemas = {
  myEntity: z.object({
    id: z.string(),
    name: z.string(),
    // ... other fields
  }),
};

export const ApiRequestSchemas = {
  createMyEntity: z.object({
    name: z.string().min(1),
    // ... other fields
  }),
};
```

2. **Add endpoints** in `api-definitions.ts`:

```typescript
export const ApiEndpoints = {
  myEntities: {
    list: '/api/my-entities',
    get: (id: string) => `/api/my-entities/${id}`,
    create: '/api/my-entities',
    update: (id: string) => `/api/my-entities/${id}`,
    delete: (id: string) => `/api/my-entities/${id}`,
  },
};
```

3. **Create API service**:

```typescript
// lib/api/my-entity-api.ts
import { z } from 'zod';
import { apiClient } from './api-client';
import { ApiEndpoints, ApiSchemas, ApiRequestSchemas } from './api-definitions';

export class MyEntityApi {
  static async getAll() {
    return apiClient.get(ApiEndpoints.myEntities.list, ApiSchemas.myEntity.array());
  }

  static async getById(id: string) {
    return apiClient.get(ApiEndpoints.myEntities.get(id), ApiSchemas.myEntity);
  }

  static async create(data: z.infer<typeof ApiRequestSchemas.createMyEntity>) {
    return apiClient.post(
      ApiEndpoints.myEntities.create,
      data,
      {
        requestSchema: ApiRequestSchemas.createMyEntity,
        responseSchema: ApiSchemas.myEntity,
      }
    );
  }

  static async update(id: string, data: Partial<z.infer<typeof ApiRequestSchemas.createMyEntity>>) {
    return apiClient.put(
      ApiEndpoints.myEntities.update(id),
      data,
      {
        responseSchema: ApiSchemas.myEntity,
      }
    );
  }

  static async delete(id: string) {
    return apiClient.delete(
      ApiEndpoints.myEntities.delete(id),
      ApiSchemas.successResponse
    );
  }
}
```

4. **Export** from `lib/api/index.ts`:

```typescript
export { MyEntityApi } from './my-entity-api';
```

## Error Handling

The API client throws errors with the following structure:

```typescript
interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}
```

Example error handling:

```typescript
try {
  const user = await UserApi.getById('123');
} catch (error) {
  if (error instanceof Error && 'status' in error) {
    const apiError = error as ApiError;
    console.error(`API Error ${apiError.status}: ${apiError.message}`);
  }
}
```

## Type Safety

All API calls are fully type-safe:

- Request data is validated against Zod schemas
- Response data is validated and typed
- TypeScript infers types from schemas
- Compile-time and runtime type checking

## Best Practices

1. **Always define schemas** for request and response data
2. **Use API services** instead of calling `apiClient` directly
3. **Handle errors** appropriately in your components
4. **Use the `useApi` hook** for React components
5. **Set authentication tokens** at the app level (e.g., in a context provider)

