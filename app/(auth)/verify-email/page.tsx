'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthApi } from '@/lib/api';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken') || searchParams.get('access_token') || undefined;
    const token = searchParams.get('token') || undefined;
    const emailParam = searchParams.get('email') || undefined;
    const typeParam = searchParams.get('type') || undefined;
    const tokenHash = searchParams.get('token_hash') || searchParams.get('tokenHash') || undefined;

    if (!accessToken && !token && !tokenHash) {
      setStatus('error');
      setMessage('Missing verification token. Please use the link from your email.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      setStatus('loading');
      setMessage('');

      try {
        const response = await AuthApi.verifyEmail({
          access_token: accessToken,
          accessToken,
          token,
          email: emailParam,
          type: typeParam,
          token_hash: tokenHash,
        });

        if (cancelled) {
          return;
        }

        setStatus('success');
        setMessage(response.data.message || 'Your email has been verified.');
        setEmail(response.data.email ?? null);
        setType(response.data.type ?? null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const fallbackMessage =
          (error as { message?: string }).message ||
          'We could not verify your email. The link may have expired or already been used.';

        setStatus('error');
        setMessage(fallbackMessage);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const isLoading = status === 'loading' || status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <main className="min-h-screen bg-[#111111] text-slate-50">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#27272a] bg-[#151515] p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-50">Verify your email</h1>
            <span className="h-2 w-2 rounded-full bg-[#facc15]" />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-8 text-sm text-[#d4d4d4]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#facc15] border-t-transparent" />
              <p>We are confirming your email address…</p>
            </div>
          )}

          {isSuccess && (
            <div className="space-y-4 text-sm text-[#d4d4d4]">
              <p className="text-[#bbf7d0]">
                {message || 'Your email has been verified successfully.'}
              </p>
              {email && (
                <p>
                  Email: <span className="font-medium text-slate-50">{email}</span>
                </p>
              )}
              {type && (
                <p className="text-xs text-[#9ca3af]">
                  Verification type: <span className="font-medium text-slate-200">{type}</span>
                </p>
              )}
              <button
                type="button"
                onClick={() => router.push('/chat')}
                className="mt-4 w-full rounded-md bg-slate-50 px-4 py-2 text-sm font-medium text-black hover:bg-slate-200"
              >
                Continue to app
              </button>
            </div>
          )}

          {isError && (
            <div className="space-y-4 text-sm text-[#fca5a5]">
              <p>{message}</p>
              <p className="text-xs text-[#9ca3af]">
                If the link has expired, request a new verification email from the app.
              </p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-4 w-full rounded-md bg-slate-50 px-4 py-2 text-sm font-medium text-black hover:bg-slate-200"
              >
                Go to login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
