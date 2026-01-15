import { useState, useCallback } from 'react';
import { apiClient, ApiClient } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <T>(
      apiCall: (client: ApiClient) => Promise<T>,
      options?: UseApiOptions
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiCall(apiClient);
        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options?.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
}

