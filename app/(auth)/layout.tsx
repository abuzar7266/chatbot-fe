import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen text-slate-50 bg-[#111111] md:bg-[linear-gradient(to_right,#111111_0%,#111111_50%,#1B1B1B_50%,#1B1B1B_100%)]">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        <section className="flex items-center justify-center px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
        <section className="hidden items-center justify-center px-10 md:flex">
          <div className="h-[420px] w-full max-w-md rounded-2xl border border-[#2b2b2b] bg-[#151515] px-8 py-8">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#a3a3a3]">
                  ChatGPT Clone
                </p>
                <h2 className="text-lg font-semibold text-slate-50">
                  Talk to your own AI assistant
                </h2>
                <p className="text-sm leading-relaxed text-[#b3b3b3]">
                  Ask questions, iterate on ideas, and explore code or content in a familiar,
                  ChatGPT-style interface powered by a modern full‑stack setup.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-[#d4d4d4]">
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#f9c956]" />
                  <span>Multi-chat layout that keeps your conversations organized.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#f9c956]" />
                  <span>Streaming responses for a smooth, real-time chat experience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#f9c956]" />
                  <span>Secure backend APIs and typed frontend built with Next.js and TypeScript.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
