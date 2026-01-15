import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  // Add more environment variables as needed
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
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      console.error(
        `❌ Environment validation failed!\n\nMissing or invalid environment variables:\n${missingVars}\n\nPlease check your .env file.`
      );
      // Return defaults in development to prevent build failures
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

// Validate environment variables at module load (server-side only)
export const env = typeof window === 'undefined' ? getEnv() : ({} as Env);

