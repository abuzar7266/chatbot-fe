import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiConfig<TRequest = unknown, TResponse = unknown> {
  endpoint: string;
  method: HttpMethod;
  requestSchema?: z.ZodSchema<TRequest>;
  responseSchema?: z.ZodSchema<TResponse>;
  headers?: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL?: string) {
    const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    this.baseURL = baseURL || envBaseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.setDefaultHeaders({ Authorization: `Bearer ${token}` });
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    const headers = { ...this.defaultHeaders };
    delete headers.Authorization;
    this.defaultHeaders = headers;
  }

  /**
   * Generic request method
   */
  private async request<TRequest, TResponse>(
    config: ApiConfig<TRequest, TResponse>,
    data?: TRequest,
    customHeaders?: Record<string, string>
  ): Promise<TResponse> {
    const { endpoint, method, requestSchema, responseSchema, headers = {} } = config;

    // Validate request data if schema provided
    if (requestSchema && data !== undefined) {
      const validationResult = requestSchema.safeParse(data);
      if (!validationResult.success) {
        throw new Error(
          `Request validation failed: ${validationResult.error.errors
            .map((issue) => issue.message)
            .join(', ')}`
        );
      }
      data = validationResult.data as TRequest;
    }

    // Build URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    // Merge headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
      ...customHeaders,
    };

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for methods that support it
    if (data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      // Parse response
      const responseData = await response.json().catch(() => null);

      // Validate response if schema provided
      if (responseSchema) {
        const validationResult = responseSchema.safeParse(responseData);
        if (!validationResult.success) {
          throw new Error(
            `Response validation failed: ${validationResult.error.errors
              .map((issue) => issue.message)
              .join(', ')}`
          );
        }
        return validationResult.data as TResponse;
      }

      return responseData as TResponse;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GET request
   */
  async get<TResponse>(
    endpoint: string,
    responseSchema?: z.ZodSchema<TResponse>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TResponse>(
      { endpoint, method: 'GET', responseSchema },
      undefined,
      headers
    );
  }

  /**
   * POST request
   */
  async post<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    config?: {
      requestSchema?: z.ZodSchema<TRequest>;
      responseSchema?: z.ZodSchema<TResponse>;
      headers?: Record<string, string>;
    }
  ): Promise<TResponse> {
    return this.request<TRequest, TResponse>(
      {
        endpoint,
        method: 'POST',
        requestSchema: config?.requestSchema,
        responseSchema: config?.responseSchema,
        headers: config?.headers,
      },
      data
    );
  }

  /**
   * PUT request
   */
  async put<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    config?: {
      requestSchema?: z.ZodSchema<TRequest>;
      responseSchema?: z.ZodSchema<TResponse>;
      headers?: Record<string, string>;
    }
  ): Promise<TResponse> {
    return this.request<TRequest, TResponse>(
      {
        endpoint,
        method: 'PUT',
        requestSchema: config?.requestSchema,
        responseSchema: config?.responseSchema,
        headers: config?.headers,
      },
      data
    );
  }

  /**
   * PATCH request
   */
  async patch<TRequest, TResponse>(
    endpoint: string,
    data: TRequest,
    config?: {
      requestSchema?: z.ZodSchema<TRequest>;
      responseSchema?: z.ZodSchema<TResponse>;
      headers?: Record<string, string>;
    }
  ): Promise<TResponse> {
    return this.request<TRequest, TResponse>(
      {
        endpoint,
        method: 'PATCH',
        requestSchema: config?.requestSchema,
        responseSchema: config?.responseSchema,
        headers: config?.headers,
      },
      data
    );
  }

  /**
   * DELETE request
   */
  async delete<TResponse>(
    endpoint: string,
    responseSchema?: z.ZodSchema<TResponse>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<unknown, TResponse>(
      { endpoint, method: 'DELETE', responseSchema },
      undefined,
      headers
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

