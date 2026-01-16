import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err: unknown) => {
          const zodIssue = err as { path: Array<string | number>; message: string };
          return `${zodIssue.path.join('.')}: ${zodIssue.message}`;
        })
        .join('\n');

      console.error(
        `Environment validation failed. Missing or invalid environment variables:\n${missingVars}`
      );

      if (process.env.NODE_ENV === 'development') {
        return {
          NODE_ENV: 'development' as const,
          NEXT_PUBLIC_APP_URL: undefined,
        };
      }

      throw new Error(`Environment validation failed: ${missingVars}`);
    }

    throw error;
  }
}

export const env = typeof window === 'undefined' ? getEnv() : ({} as Env);

