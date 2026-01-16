import { z } from 'zod';
import { apiClient } from './api-client';

const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

const DbUserSchema = z.object({
  id: z.string(),
  supabaseId: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  fullName: z.string().nullable(),
  createdAt: z.string(),
});

const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  fullName: z.string().nullable(),
  metadata: z.record(z.unknown()),
  dbUser: DbUserSchema,
});

const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
});

const SignUpResponseSchema = z.object({
  data: z.object({
    user: AuthUserSchema,
    dbUser: DbUserSchema,
    message: z.string(),
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
    user: AuthUserSchema,
  }),
  statusCode: z.number(),
  timestamp: z.string(),
});

const VerifyEmailResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    email: z.string().email().nullable(),
    type: z.string().nullable(),
  }),
  statusCode: z.number(),
  timestamp: z.string(),
});

const UserProfileResponseSchema = z.object({
  data: UserProfileSchema,
  statusCode: z.number(),
  timestamp: z.string(),
});

const SyncSupabaseUserRequestSchema = z.object({
  accessToken: z.string().optional(),
});

const SyncSupabaseUserResponseSchema = z.object({
  data: UserProfileSchema,
  statusCode: z.number(),
  timestamp: z.string(),
});

const UpdateProfileRequestSchema = z.object({
  fullName: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type DbUser = z.infer<typeof DbUserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type SignUpResponse = z.infer<typeof SignUpResponseSchema>;

export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type SignInResponse = z.infer<typeof SignInResponseSchema>;

export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

export type SyncSupabaseUserRequest = z.infer<typeof SyncSupabaseUserRequestSchema>;
export type SyncSupabaseUserResponse = z.infer<typeof SyncSupabaseUserResponseSchema>;

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

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
  const response = await apiClient.post<SignInRequest, SignInResponse>(
    '/auth/signin',
    payload,
    {
      requestSchema: SignInRequestSchema,
      responseSchema: SignInResponseSchema,
    }
  );

  const token = response.data.accessToken;
  if (token) {
    apiClient.setAuthToken(token);
  }

  return response;
}

async function verifyEmail(query: {
  access_token?: string;
  accessToken?: string;
  type?: string;
  token?: string;
  email?: string;
  token_hash?: string;
} = {}): Promise<VerifyEmailResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiClient.get<VerifyEmailResponse>(
    `/auth/verify-email${suffix}`,
    VerifyEmailResponseSchema
  );
}

async function getProfile(): Promise<UserProfileResponse> {
  return apiClient.get<UserProfileResponse>('/auth/me', UserProfileResponseSchema);
}

async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
  return apiClient.patch<UpdateProfileRequest, UserProfileResponse>(
    '/auth/me',
    payload,
    {
      requestSchema: UpdateProfileRequestSchema,
      responseSchema: UserProfileResponseSchema,
    }
  );
}

async function syncSupabaseUser(
  payload: SyncSupabaseUserRequest = {}
): Promise<SyncSupabaseUserResponse> {
  return apiClient.post<SyncSupabaseUserRequest, SyncSupabaseUserResponse>(
    '/auth/sync-supabase-user',
    payload,
    {
      requestSchema: SyncSupabaseUserRequestSchema,
      responseSchema: SyncSupabaseUserResponseSchema,
    }
  );
}

export const AuthApi = {
  signUp,
  signIn,
  verifyEmail,
  getProfile,
  updateProfile,
  syncSupabaseUser,
};
