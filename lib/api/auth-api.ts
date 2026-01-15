import { z } from 'zod';
import { apiClient } from './api-client';

const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const SignUpResponseSchema = z.object({
  data: z.object({
    user: z.any().optional(),
    dbUser: z.any().optional(),
    message: z.string().optional(),
  }),
  statusCode: z.number(),
  timestamp: z.string(),
});

const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const SignInResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    user: z.any(),
  }),
  statusCode: z.number(),
  timestamp: z.string(),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type SignUpResponse = z.infer<typeof SignUpResponseSchema>;

export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type SignInResponse = z.infer<typeof SignInResponseSchema>;

async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  return apiClient.post<SignUpRequest, SignUpResponse>(
    '/auth/signup',
    payload,
    {
      requestSchema: SignUpRequestSchema,
      responseSchema: SignUpResponseSchema,
    }
  );
}

async function signIn(payload: SignInRequest): Promise<SignInResponse> {
  return apiClient.post<SignInRequest, SignInResponse>(
    '/auth/signin',
    payload,
    {
      requestSchema: SignInRequestSchema,
      responseSchema: SignInResponseSchema,
    }
  );
}

export const AuthApi = {
  signUp,
  signIn,
};
