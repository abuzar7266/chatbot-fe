import { z } from 'zod';
import { apiClient } from './api-client';

const HealthStatusSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
});

const RootHealthResponseSchema = z.object({
  data: z.string(),
  statusCode: z.number(),
  timestamp: z.string(),
});

const HealthResponseSchema = z.object({
  data: HealthStatusSchema,
  statusCode: z.number(),
  timestamp: z.string(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type RootHealthResponse = z.infer<typeof RootHealthResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

async function getRoot(): Promise<RootHealthResponse> {
  return apiClient.get<RootHealthResponse>('/', RootHealthResponseSchema);
}

async function getHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health', HealthResponseSchema);
}

export const HealthApi = {
  getRoot,
  getHealth,
};

