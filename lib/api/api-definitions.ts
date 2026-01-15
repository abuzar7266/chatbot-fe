import { z } from 'zod';
import { apiClient, ApiClient } from './api-client';

/**
 * API Response schemas
 */
export const ApiSchemas = {
  // Common response schemas
  successResponse: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),

  errorResponse: z.object({
    error: z.string(),
    message: z.string().optional(),
    statusCode: z.number().optional(),
  }),

  // Example: User schemas
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string(),
  }),

  userList: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      createdAt: z.string(),
    })
  ),

  // Example: Product schemas
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    stock: z.number(),
  }),
};

/**
 * API Request schemas
 */
export const ApiRequestSchemas = {
  // Example: Create user request
  createUser: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),

  // Example: Update user request
  updateUser: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  }),

  // Example: Create product request
  createProduct: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
  }),

  // Example: Update product request
  updateProduct: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
  }),
};

/**
 * API Endpoints configuration
 */
export const ApiEndpoints = {
  // Health check
  health: '/api/health',

  // User endpoints
  users: {
    list: '/api/users',
    get: (id: string) => `/api/users/${id}`,
    create: '/api/users',
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },

  // Product endpoints
  products: {
    list: '/api/products',
    get: (id: string) => `/api/products/${id}`,
    create: '/api/products',
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
  },
} as const;

