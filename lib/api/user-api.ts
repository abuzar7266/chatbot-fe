import { z } from 'zod';
import { apiClient } from './api-client';
import { ApiEndpoints, ApiSchemas, ApiRequestSchemas } from './api-definitions';

/**
 * User API service
 * Type-safe API calls for user operations
 */
export class UserApi {
  /**
   * Get all users
   */
  static async getAll() {
    return apiClient.get(ApiEndpoints.users.list, ApiSchemas.userList);
  }

  /**
   * Get user by ID
   */
  static async getById(id: string) {
    return apiClient.get(ApiEndpoints.users.get(id), ApiSchemas.user);
  }

  /**
   * Create a new user
   */
  static async create(data: z.infer<typeof ApiRequestSchemas.createUser>) {
    return apiClient.post(
      ApiEndpoints.users.create,
      data,
      {
        requestSchema: ApiRequestSchemas.createUser,
        responseSchema: ApiSchemas.user,
      }
    );
  }

  /**
   * Update user
   */
  static async update(
    id: string,
    data: z.infer<typeof ApiRequestSchemas.updateUser>
  ) {
    return apiClient.put(
      ApiEndpoints.users.update(id),
      data,
      {
        requestSchema: ApiRequestSchemas.updateUser,
        responseSchema: ApiSchemas.user,
      }
    );
  }

  /**
   * Delete user
   */
  static async delete(id: string) {
    return apiClient.delete(
      ApiEndpoints.users.delete(id),
      ApiSchemas.successResponse
    );
  }
}

