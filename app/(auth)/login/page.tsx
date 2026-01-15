'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Button,
  Input,
} from '@/components/ui';
import { AuthApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useNotification } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();
  const { notify } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthApi.signIn({ email, password });
      const { accessToken, user } = response.data;

      login(
        {
          id: user.id,
          name: user.user_metadata?.fullName ?? user.email ?? '',
          email: user.email,
        },
        accessToken
      );

      notify.success('Signed in successfully');
      router.push('/');
    } catch (err: any) {
      const message =
        err?.message || 'Failed to sign in. Please check your credentials and try again.';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3">
          <div className="relative h-9 w-9">
            <Image
              src="/assets/auth-logo.png"
              alt="TuringTech Test logo"
              fill
              className="rounded-lg object-contain"
              sizes="36px"
              priority
            />
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            TuringTech Test
          </span>
        </div>
      </div>

      <Card className="w-full rounded-2xl border-[#2b2b2b] bg-[#151515] text-slate-50 shadow-lg">
        <CardHeader className="space-y-1 px-8 pt-8 pb-4">
          <h1 className="text-lg font-semibold text-center">
            Login to TuringTech Test
          </h1>
        </CardHeader>
        <CardContent className="px-8 pb-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-slate-200">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                disabled={isLoading}
                size="md"
                className="h-10 border-[#343434] bg-[#1c1c1c] text-xs placeholder:text-[#8b8b8b]"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-200"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                disabled={isLoading}
                size="md"
                className="h-10 border-[#343434] bg-[#1c1c1c] text-xs placeholder:text-[#8b8b8b]"
              />
            </div>
            <Button
              type="submit"
              className="mt-3 h-10 w-full rounded-md bg-white text-xs font-medium text-black hover:bg-slate-100 disabled:opacity-70"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>

            <div className="flex items-center gap-2 pt-2 text-[10px] text-[#6b6b6b]">
              <div className="h-px flex-1 bg-[#2b2b2b]" />
              <span>Or</span>
              <div className="h-px flex-1 bg-[#2b2b2b]" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="flex h-9 w-full items-center justify-center gap-2 border-[#343434] bg-[#1c1c1c] text-[11px] font-normal text-slate-100 hover:bg-[#222222]"
            >
              <Image
                src="/assets/google%20logo.png"
                alt="Google logo"
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex h-9 w-full items-center justify-center gap-2 border-[#343434] bg-[#1c1c1c] text-[11px] font-normal text-slate-100 hover:bg-[#222222]"
            >
              <Image
                src="/assets/apple-logo.svg"
                alt="Apple logo"
                width={15}
                height={18}
                className="h-4 w-auto"
              />
              <span>Continue with Apple</span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-6 pt-2">
          <p className="w-full text-center text-[11px] text-[#a3a3a3]">
            Or{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-[#f9c956] underline-offset-2 hover:underline"
            >
              click here to sign up
            </button>{' '}
            and get started
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
