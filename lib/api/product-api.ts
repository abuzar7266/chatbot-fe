import { z } from 'zod';
import { apiClient } from './api-client';
import { ApiEndpoints, ApiSchemas, ApiRequestSchemas } from './api-definitions';

/**
 * Product API service
 * Type-safe API calls for product operations
 */
export class ProductApi {
  /**
   * Get all products
   */
  static async getAll() {
    return apiClient.get(ApiEndpoints.products.list, ApiSchemas.product.extend({}).array());
  }

  /**
   * Get product by ID
   */
  static async getById(id: string) {
    return apiClient.get(ApiEndpoints.products.get(id), ApiSchemas.product);
  }

  /**
   * Create a new product
   */
  static async create(data: z.infer<typeof ApiRequestSchemas.createProduct>) {
    return apiClient.post(
      ApiEndpoints.products.create,
      data,
      {
        requestSchema: ApiRequestSchemas.createProduct,
        responseSchema: ApiSchemas.product,
      }
    );
  }

  /**
   * Update product
   */
  static async update(
    id: string,
    data: z.infer<typeof ApiRequestSchemas.updateProduct>
  ) {
    return apiClient.patch(
      ApiEndpoints.products.update(id),
      data,
      {
        requestSchema: ApiRequestSchemas.updateProduct,
        responseSchema: ApiSchemas.product,
      }
    );
  }

  /**
   * Delete product
   */
  static async delete(id: string) {
    return apiClient.delete(
      ApiEndpoints.products.delete(id),
      ApiSchemas.successResponse
    );
  }
}

