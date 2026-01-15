'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button, Card, CardHeader, CardContent, Skeleton } from '@/components/ui';

const mockChats = [
  { id: '1', title: 'New chat' },
  { id: '2', title: 'Debugging a TypeScript error' },
  { id: '3', title: 'Brainstorm marketing ideas' },
  { id: '4', title: 'Refactor React components' },
];

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>('1');

  const selectedChat = mockChats.find((chat) => chat.id === selectedChatId) ?? mockChats[0];

  return (
    <main className="min-h-screen bg-[#050505] text-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] flex-col border-r border-[#262626] bg-[#101010] px-4 py-5 md:flex">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              <div className="relative h-7 w-7">
                <Image
                  src="/assets/auth-logo.png"
                  alt="ChatGPT Clone logo"
                  fill
                  className="rounded-md object-contain"
                  sizes="28px"
                  priority
                />
              </div>
              <span className="text-sm font-semibold tracking-tight">ChatGPT Clone</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5 h-9 w-full justify-start gap-2 border-[#2b2b2b] bg-[#181818] text-xs font-medium text-slate-50 hover:bg-[#202020]"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-50 text-[10px] font-bold text-black">
              +
            </span>
            <span>New chat</span>
          </Button>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto text-xs text-[#d4d4d4]">
            {mockChats.map((chat) => {
              const isActive = chat.id === selectedChatId;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'bg-[#1f2933] text-slate-50'
                      : 'bg-transparent text-[#a3a3a3] hover:bg-[#111827] hover:text-slate-50'
                  }`}
                >
                  <span className="truncate">{chat.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#262626] bg-[#050505]/95 px-4 py-3 md:px-6">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#9ca3af]">
                Chat
              </span>
              <h1 className="text-sm font-semibold text-slate-50 md:text-base">
                {selectedChat?.title || 'New chat'}
              </h1>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-9 gap-2 border-[#2b2b2b] bg-[#050505] text-xs text-slate-100 hover:bg-[#101010] md:inline-flex"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-50 text-[10px] font-bold text-black">
                +
              </span>
              <span>New chat</span>
            </Button>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 md:px-8">
            <Card className="w-full max-w-2xl rounded-2xl border-[#262626] bg-[#060606] text-slate-50 shadow-lg">
              <CardHeader className="border-b border-[#262626] px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-50 md:text-base">
                  Start a conversation
                </h2>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  Select a chat from the left or create a new one to begin talking to your AI
                  assistant.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 px-6 py-5">
                <Skeleton className="h-3 w-1/2 rounded-full bg-[#1f2933]" />
                <Skeleton className="h-3 w-3/4 rounded-full bg-[#1f2933]" />
                <Skeleton className="h-3 w-2/3 rounded-full bg-[#1f2933]" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

