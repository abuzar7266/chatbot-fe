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
import { useNotification } from '@/hooks';

export default function SignupPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!acceptTerms) {
      const message = 'You must accept the terms and conditions to continue.';
      setError(message);
      notify.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AuthApi.signUp({ email, password });
      const message =
        response.data.message ||
        'Sign up successful. Please check your email to verify your account.';

      notify.success(message);
      router.push('/login');
    } catch (err: any) {
      const message =
        err?.message ||
        'Failed to sign up. Please check your details and try again.';
      setError(message);
      notify.error(message);
    } finally {
      setIsSubmitting(false);
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
            Unlock your edge with TuringTech Test
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
                disabled={isSubmitting}
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                disabled={isSubmitting}
                size="md"
                className="h-10 border-[#343434] bg-[#1c1c1c] text-xs placeholder:text-[#8b8b8b]"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                className="mt-[2px] h-3.5 w-3.5 rounded border border-[#343434] bg-[#111111]"
              />
              <label
                htmlFor="acceptTerms"
                className="text-[11px] text-[#a3a3a3]"
              >
                I accept the{' '}
                <span className="text-[#f9c956] underline-offset-2">
                  terms and conditions
                </span>{' '}
                and{' '}
                <span className="text-[#f9c956] underline-offset-2">
                  privacy policy
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="mt-3 h-10 w-full rounded-md bg-white text-xs font-medium text-black hover:bg-slate-100 disabled:opacity-70"
              disabled={isSubmitting || !email || !password || !acceptTerms}
            >
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
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
              <span>Sign up with Google</span>
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
              <span>Sign up with Apple</span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-6 pt-2">
          <p className="w-full text-center text-[11px] text-[#a3a3a3]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[#f9c956] underline-offset-2 hover:underline"
            >
              Login here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
