'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ChatApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store';
import type { Chat, ChatMessage } from '@/store/chat-store';

type ParsedSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

const parseMarkdownSections = (markdown: string): ParsedSection[] => {
  const lines = markdown.split('\n');
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  let currentParagraph = '';

  const pushParagraph = () => {
    if (!current) {
      return;
    }
    const trimmed = currentParagraph.trim();
    if (trimmed.length > 0) {
      current.paragraphs.push(trimmed);
    }
    currentParagraph = '';
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('## ')) {
      if (current) {
        pushParagraph();
        sections.push(current);
      }
      current = {
        heading: line.slice(3).trim(),
        paragraphs: [],
        items: [],
      };
      currentParagraph = '';
      continue;
    }

    if (line.startsWith('- ')) {
      if (!current) {
        current = {
          heading: '',
          paragraphs: [],
          items: [],
        };
      }
      pushParagraph();
      current.items.push(line.slice(2).trim());
      continue;
    }

    if (line === '') {
      pushParagraph();
      continue;
    }

    if (!current) {
      current = {
        heading: '',
        paragraphs: [],
        items: [],
      };
    }

    if (currentParagraph.length > 0) {
      currentParagraph += ' ';
    }
    currentParagraph += line;
  }

  if (current) {
    pushParagraph();
    sections.push(current);
  }

  return sections;
};

const getDisplayDate = (message: ChatMessage) => {
  const original = new Date(message.createdAt);
  const date =
    message.source === 'api'
      ? new Date(original.getTime() + 5 * 60 * 60 * 1000)
      : original;

  const dateLabel = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return { dateLabel, timeLabel };
};

const deriveTitleFromResponse = (markdown: string): string => {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('## ')) {
      return trimmedLine.slice(3);
    }
  }

  const firstNonEmpty = lines.find((line) => line.trim().length > 0);
  if (firstNonEmpty) {
    const cleaned = firstNonEmpty.trim();
    return cleaned.length > 60 ? `${cleaned.slice(0, 57)}...` : cleaned;
  }

  return 'New chat';
};

export default function ChatPage() {
  const { isAuthenticated, token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const chatIdFromUrl = pathSegments.length >= 2 && pathSegments[0] === 'chat' ? pathSegments[1] : '';
  const { chats, setChats, isInitialLoading, setIsInitialLoading } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'steps' | 'questions'>('output');

  const [inputValue, setInputValue] = useState('');
  const [pendingAssistantChatId, setPendingAssistantChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [, setStreamedText] = useState('');
  const [loadingDots, setLoadingDots] = useState('...');
  const [currentStreamAssistantId, setCurrentStreamAssistantId] = useState<string | null>(null);
  const [pendingTitleChatId] = useState<string | null>(null);
  const [isMessagesScrollLoading, setIsMessagesScrollLoading] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const rawName = user?.fullName?.trim() || '';
  const rawEmail = user?.email?.trim() || '';
  const hasDistinctName = rawName.length > 0 && rawName !== rawEmail;
  const displayName = hasDistinctName ? rawName : rawEmail || 'User';
  const displayEmail = hasDistinctName ? rawEmail : '';
  const initials = (() => {
    const source =
      (user?.fullName && user.fullName.trim()) ||
      (user?.email && user.email.trim()) ||
      '';
    if (!source) {
      return '';
    }
    if (source.includes('@')) {
      const local = source.split('@')[0];
      if (!local) {
        return '';
      }
      return local.slice(0, 2).toUpperCase();
    }
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  const selectedChat = chatIdFromUrl
    ? chats.find((chat) => chat.id === chatIdFromUrl)
    : chats[0];
  const allMessages = selectedChat?.messages ?? [];

  const loadMessagesForChat = useCallback(
    async (chatId: string) => {
      setIsInitialLoading(true);

      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== chatId) {
            return chat;
          }

          if (chat.messages.length > 0 || chat.isMessagesLoading) {
            return chat;
          }

          return {
            ...chat,
            isMessagesLoading: true,
          };
        })
      );

      try {
        const response = await ChatApi.listMessages(chatId, {
          page: 1,
          limit: 50,
        });

        const data = response.data;
        const items = data.items;

        const messages: ChatMessage[] = items.map((message) => ({
          id: message.id,
          role: message.role,
          createdAt: message.createdAt,
          content: message.content,
          previousMessageId: (message as { previousMessageId: string | null | undefined }).previousMessageId ?? null,
        }));

        const hasMore = data.page * data.limit < data.total;

        setChats((previous) =>
          previous.map((chat) => {
            if (chat.id !== chatId) {
              return chat;
            }

            return {
              ...chat,
              mode: messages.length > 0 ? 'doc' : chat.mode,
              messages,
              messagesPage: data.page,
              hasMoreMessages: hasMore,
              isMessagesLoading: false,
              isLoadingMoreMessages: false,
            };
          })
        );
      } catch {
        setChats((previous) =>
          previous.map((chat) => {
            if (chat.id !== chatId) {
              return chat;
            }

            return {
              ...chat,
              isMessagesLoading: false,
            };
          })
        );
      } finally {
        setIsInitialLoading(false);
      }
    },
    [setIsInitialLoading, setChats]
  );

  useEffect(() => {
    let cancelled = false;

    const loadChats = async () => {
      if (!isAuthenticated) {
        return;
      }

      setIsInitialLoading(true);

      try {
        const hasExplicitChat = !!chatIdFromUrl;

        const response = await ChatApi.listChats();
        if (cancelled) {
          return;
        }

        let remoteChats: Chat[] = response.data.map((chat) => ({
          id: chat.id,
          title: chat.title || 'New chat',
          mode: 'empty',
          messages: [],
          messagesPage: 0,
          hasMoreMessages: true,
          isMessagesLoading: false,
          isLoadingMoreMessages: false,
        }));

        let defaultChatId: string | null = null;

        if (!hasExplicitChat) {
          const candidateChats = remoteChats.filter(
            (chat) => (chat.title || '').trim().toLowerCase() === 'new chat'
          );

          for (const chat of candidateChats) {
            try {
              const messagesResponse = await ChatApi.listMessages(chat.id, {
                page: 1,
                limit: 1,
              });

              if (cancelled) {
                return;
              }

              const messagesData = messagesResponse.data;
              const hasMessages =
                messagesData.total > 0 || messagesData.items.length > 0;

              if (!hasMessages) {
                defaultChatId = chat.id;
                break;
              }
            } catch {
            }
          }

          if (!defaultChatId) {
            const createResponse = await ChatApi.createChat();
            if (cancelled) {
              return;
            }

            const chat = createResponse.data.chat;

            remoteChats = [
              {
                id: chat.id,
                title: chat.title || 'New chat',
                mode: 'empty',
                messages: [],
                messagesPage: 0,
                hasMoreMessages: true,
                isMessagesLoading: false,
                isLoadingMoreMessages: false,
              },
              ...remoteChats,
            ];

            defaultChatId = chat.id;
          }
        }

        setChats(remoteChats);

        const nextSelectedChatId = hasExplicitChat
          ? chatIdFromUrl || remoteChats[0]?.id || ''
          : defaultChatId || remoteChats[0]?.id || '';

        if (!hasExplicitChat && nextSelectedChatId && nextSelectedChatId !== chatIdFromUrl) {
          router.push(`/chat/${nextSelectedChatId}`);
        }
      } catch {
      } finally {
      }
    };

    loadChats();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, chatIdFromUrl, router, setChats, setIsInitialLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const chatId = chatIdFromUrl || selectedChat?.id;

    if (!chatId) {
      return;
    }

    loadMessagesForChat(chatId);
  }, [isAuthenticated, chatIdFromUrl, selectedChat?.id, loadMessagesForChat]);

  useEffect(() => {
    if (!isThinking) {
      setLoadingDots('...');
      return;
    }

    const frames = ['.', '..', '...'];
    let index = 0;

    const interval = setInterval(() => {
      setLoadingDots(frames[index]);
      index = (index + 1) % frames.length;
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [isThinking]);

  const handleNewChat = async () => {
    const existingEmptyChat = chats.find(
      (chat) => chat.mode === 'empty' && chat.messages.length === 0
    );

    if (existingEmptyChat) {
      router.push(`/chat/${existingEmptyChat.id}`);
      return;
    }

    try {
      const response = await ChatApi.createChat();
      const chat = response.data.chat;

      const newChat: Chat = {
        id: chat.id,
        title: chat.title || 'New chat',
        mode: 'empty',
        messages: [],
      };

      setChats((previous) => [newChat, ...previous]);
      router.push(`/chat/${newChat.id}`);
    } catch {
    }
  };

  useEffect(() => {
    if (!shouldScrollToBottom) {
      return;
    }

    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
    setShouldScrollToBottom(false);
  }, [shouldScrollToBottom, chatIdFromUrl, allMessages.length]);

  const handleMessagesScroll = async (
    event: React.UIEvent<HTMLDivElement>
  ) => {
    const container = event.currentTarget;

    if (!selectedChat) {
      return;
    }

    const chatId = selectedChat.id;

    if (
      container.scrollTop > 50 ||
      isMessagesScrollLoading ||
      selectedChat.isLoadingMoreMessages ||
      !selectedChat.hasMoreMessages
    ) {
      return;
    }

    setIsMessagesScrollLoading(true);

    setChats((previous) =>
      previous.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,
          isLoadingMoreMessages: true,
        };
      })
    );

    try {
      const nextPage = (selectedChat.messagesPage ?? 1) + 1;

      const response = await ChatApi.listMessages(chatId, {
        page: nextPage,
        limit: 50,
      });

      const data = response.data;
      const items = data.items;

      if (!items || items.length === 0) {
        setChats((previous) =>
          previous.map((chat) => {
            if (chat.id !== chatId) {
              return chat;
            }

            return {
              ...chat,
              hasMoreMessages: false,
              isLoadingMoreMessages: false,
            };
          })
        );

        setIsMessagesScrollLoading(false);
        return;
      }

      const newMessages: ChatMessage[] = items.map((message) => ({
        id: message.id,
        role: message.role,
        createdAt: message.createdAt,
        content: message.content,
        previousMessageId: (message as { previousMessageId: string | null | undefined }).previousMessageId ?? null,
      }));

      const hasMore = data.page * data.limit < data.total;

      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== chatId) {
            return chat;
          }

          const existingMessages = chat.messages;
          const existingIds = new Set(existingMessages.map((message) => message.id));
          const mergedMessages = [
            ...newMessages.filter((message) => !existingIds.has(message.id)),
            ...existingMessages,
          ];

          return {
            ...chat,
            messages: mergedMessages,
            messagesPage: data.page,
            hasMoreMessages: hasMore,
            isLoadingMoreMessages: false,
          };
        })
      );
    } catch {
      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== chatId) {
            return chat;
          }

          return {
            ...chat,
            isLoadingMoreMessages: false,
          };
        })
      );
    }

    setIsMessagesScrollLoading(false);
  };

  const handleSendMessage = () => {
    if (!selectedChat) {
      return;
    }

    const trimmed = inputValue.trim();

    if (!trimmed || isThinking) {
      return;
    }

    const chatId = selectedChat.id;

    const userMessage: ChatMessage = {
      id: `u-${Date.now().toString()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      content: trimmed,
    };

    const localUserMessageId = userMessage.id;

    const isFirstMessageInEmptyChat =
      selectedChat.mode === 'empty' && selectedChat.messages.length === 0;

    setChats((previous) =>
      previous.map((chat) => {
        if (chat.id !== selectedChat.id) {
          return chat;
        }

        const nextMode = chat.mode === 'empty' ? 'doc' : chat.mode;

        return {
          ...chat,
          mode: nextMode,
          messages: [...chat.messages, userMessage],
        };
      })
    );

    setInputValue('');
    setPendingAssistantChatId(chatId);
    setIsThinking(true);
    setStreamedText('');
    setActiveTab('output');
    setCurrentStreamAssistantId(null);
    setShouldScrollToBottom(true);

    let fullText = '';
    let hasFetchedTitle = false;

    const finalize = () => {
      setIsThinking(false);
      setPendingAssistantChatId(null);
      setStreamedText('');
      setCurrentStreamAssistantId(null);

      if (!fullText) {
        return;
      }

      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== chatId) {
            return chat;
          }

          const nextMode = chat.mode === 'empty' ? 'doc' : chat.mode;

          const nextTitle =
            isFirstMessageInEmptyChat && chat.title === 'New chat'
              ? deriveTitleFromResponse(fullText)
              : chat.title;

          return {
            ...chat,
            mode: nextMode,
            title: nextTitle,
          };
        })
      );
    };

    const authToken = token;

    if (!authToken) {
      finalize();
      return;
    }

    ChatApi.streamChat(chatId, trimmed, authToken, (chunk) => {
      if (chunk.role === 'assistant') {
        fullText += chunk.content;

        if (isFirstMessageInEmptyChat && !hasFetchedTitle) {
          hasFetchedTitle = true;

          ChatApi.getChat(chatId)
            .then((response) => {
              const remoteChat = response.data;

              setChats((previous) =>
                previous.map((chat) => {
                  if (chat.id !== chatId) {
                    return chat;
                  }

                  return {
                    ...chat,
                    title: remoteChat.title || chat.title,
                  };
                })
              );
            })
            .catch(() => {
            });
        }
      }

      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== chatId) {
            return chat;
          }

          const nextMode = chat.mode === 'empty' ? 'doc' : chat.mode;

          const existingIndex = chat.messages.findIndex(
            (message) => message.id === chunk.messageId
          );

          if (existingIndex === -1) {
            const newMessage: ChatMessage = {
              id: chunk.messageId,
              role: chunk.role,
              createdAt: chunk.createdAt,
              content: chunk.content,
            };

            const filteredMessages =
              chunk.role === 'user'
                ? chat.messages.filter((message) => message.id !== localUserMessageId)
                : chat.messages;

            if (chunk.role === 'assistant') {
              setCurrentStreamAssistantId(chunk.messageId);
            }

            return {
              ...chat,
              mode: nextMode,
              messages: [...filteredMessages, newMessage],
            };
          }

          const nextMessages: ChatMessage[] = chat.messages.map((message) => {
            if (message.id !== chunk.messageId) {
              return message;
            }

            return {
              ...message,
              content: message.content + chunk.content,
            };
          });

          return {
            ...chat,
            mode: nextMode,
            messages: nextMessages,
          };
        })
      );

      setStreamedText(fullText);
    })
      .then(() => {
        finalize();
      })
      .catch(() => {
        finalize();
      });
  };

  if (isInitialLoading && chats.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111111] text-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#f9c956] border-t-transparent" />
          <p className="text-sm text-[#e5e7eb]">Loading your workspace…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] text-slate-50">
      <div className="flex h-screen">
        <aside
          className={`hidden h-full flex-col bg-[#171717] border-r border-[#18181b] md:flex ${
            isSidebarOpen ? 'w-60' : 'w-16'
          }`}
        >
          {isSidebarOpen ? (
            <div className="flex h-full flex-col px-3 py-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    isSidebarOpen
                      ? 'bg-[#111111] text-[#e5e7eb]'
                      : 'bg-transparent text-[#6b7280] hover:bg-[#111111]'
                  }`}
                >
                  <Image
                    src="/assets/sidebar-open.svg"
                    alt="Open sidebar"
                    width={20}
                    height={20}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    !isSidebarOpen
                      ? 'bg-[#111111] text-[#e5e7eb]'
                      : 'bg-transparent text-[#6b7280] hover:bg-[#111111]'
                  }`}
                >
                  <Image
                    src="/assets/sidebar-icon-1.svg"
                    alt="Collapse sidebar"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              <div className="mt-6 space-y-2 text-xs text-[#e5e7eb]">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-[#111111] active:bg-[#262626] transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#111111] text-[#e5e7eb]">
                    <Image
                      src="/assets/sidebar-icon-2.svg"
                      alt="New chat"
                      width={20}
                      height={20}
                    />
                  </span>
                  <span>New chat</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-[#111111] active:bg-[#262626] transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-[#6b7280]">
                    <Image
                      src="/assets/sidebar-icon-3.svg"
                      alt="Quick actions"
                      width={20}
                      height={20}
                    />
                  </span>
                  <span>Quick Actions</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-[#111111] active:bg-[#262626] transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-[#6b7280]">
                    <Image
                      src="/assets/sidebar-icon-4.svg"
                      alt="Spaces"
                      width={20}
                      height={20}
                    />
                  </span>
                  <span>Spaces</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-[#111111] active:bg-[#262626] transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-[#6b7280]">
                    <Image
                      src="/assets/sidebar-icon-5.svg"
                      alt="Chat history"
                      width={20}
                      height={20}
                    />
                  </span>
                  <span>Chat History</span>
                </button>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[#9ca3af]">
                {chats
                  .filter(chat => {
                    const isDefaultEmptyChat =
                      (chat.title || '').trim().toLowerCase() === 'new chat' &&
                      chat.mode === 'empty' &&
                      (chat.messages?.length ?? 0) === 0;

                    if (!isDefaultEmptyChat) {
                      return true;
                    }

                    return chat.id === selectedChat?.id;
                  })
                  .map(chat => {
                  const isActive = chat.id === selectedChat?.id;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        const path = `/chat/${chat.id}`;
                        router.push(path);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${
                        isActive ? 'bg-[#525252] text-[#f9fafb]' : 'hover:bg-[#050815]'
                      }`}
                    >
                      <span className="line-clamp-1 text-xs">{chat.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-auto border-t border-[#18181b] pt-4 text-[11px] text-[#9ca3af]">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((previous) => !previous)}
                  className="flex w-full items-center gap-2 rounded-md px-1 py-1 hover:bg-[#111111]"
                >
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[10px] font-semibold uppercase text-[#e5e7eb]">
                    {initials || displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-[#e5e7eb]">{displayName}</span>
                    {displayEmail && (
                      <span className="text-[10px] text-[#6b7280]">{displayEmail}</span>
                    )}
                  </div>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute bottom-10 left-0 z-20 w-40 rounded-md border border-[#27272a] bg-[#18181b] py-1 text-xs text-[#e5e7eb] shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        useAuthStore.getState().logout();
                        router.push('/login');
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left hover:bg-[#111111]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-between px-3 py-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      isSidebarOpen
                        ? 'bg-[#111111] text-[#e5e7eb]'
                        : 'bg-transparent text-[#6b7280] hover:bg-[#111111]'
                    }`}
                  >
                    <Image
                      src="/assets/sidebar-open.svg"
                      alt="Open sidebar"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>

                <nav className="mt-6 space-y-3 text-xs text-[#6b7280]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-md bg-[#111111] px-1 py-2 text-[#e5e7eb] active:bg-[#262626] transition-colors"
                  >
                    <Image
                      src="/assets/sidebar-icon-2.svg"
                      alt="New chat"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-md bg-transparent px-1 py-2 text-[#6b7280] hover:bg-[#111111] active:bg-[#262626] transition-colors"
                  >
                    <Image
                      src="/assets/sidebar-icon-3.svg"
                      alt="Quick actions"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-md bg-transparent px-1 py-2 text-[#6b7280] hover:bg-[#111111] active:bg-[#262626] transition-colors"
                  >
                    <Image
                      src="/assets/sidebar-icon-4.svg"
                      alt="Spaces"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-md bg-transparent px-1 py-2 text-[#6b7280] hover:bg-[#111111] active:bg-[#262626] transition-colors"
                  >
                    <Image
                      src="/assets/sidebar-icon-5.svg"
                      alt="Chat history"
                      width={20}
                      height={20}
                    />
                  </button>
                </nav>
              </div>

              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-xs font-semibold uppercase text-[#e5e7eb]">
                {initials || displayName.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </aside>

        <section className="flex flex-1 flex-col bg-[#101010]">
          <header className="flex items-center justify-end px-6 py-4">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-[#e5e7eb]"
            >
              <span className="h-3 w-3 rounded-full border border-[#e5e7eb]" />
            </button>
          </header>

          <div className="flex flex-1 justify-center px-6 pb-6 pt-2">
            <div className="flex w-full max-w-4xl flex-col">
              {isInitialLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#f9c956] border-t-transparent" />
                    <p className="text-sm text-[#e5e7eb]">Loading your workspace…</p>
                  </div>
                </div>
              ) : selectedChat?.mode === 'empty' && allMessages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex w-full flex-col items-center justify-center gap-8">
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-[#111111]">
                      <Image
                        src="/assets/auth-logo.png"
                        alt="Platform logo"
                        width={128}
                        height={128}
                        className="h-32 w-32 rounded-2xl object-contain"
                      />
                    </div>
                    <div className="w-full max-w-xl">
                      <div className="mx-auto flex w-full items-center rounded-full bg-[#171717] px-4 py-2 text-sm text-[#6b7280] ring-1 ring-[#18181b]">
                        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#111111] text-lg leading-none text-[#9ca3af]">
                          +
                        </span>
                        <input
                          type="text"
                          placeholder="Ask something..."
                          className="mr-3 flex-1 bg-transparent text-[13px] text-[#e5e7eb] outline-none placeholder:text-[#6b7280]"
                          value={inputValue}
                          onChange={(event) => setInputValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111]"
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isThinking}
                        >
                          <Image
                            src="/assets/chat-send.svg"
                            alt="Send message"
                            width={19}
                            height={19}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-3xl bg-[#101010]">
                  <div className="relative flex h-full flex-col">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-0 pt-0">
                      <div className="flex flex-col gap-4">
                        <h1
                          className={`text-xl font-semibold text-[#f9fafb] transition-opacity duration-500 ${
                            pendingTitleChatId === selectedChat?.id ? 'opacity-40' : 'opacity-100'
                          }`}
                        >
                          {selectedChat?.title}
                        </h1>
                        <div className="inline-flex items-center gap-2 rounded-full bg-transparent p-1 text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveTab('output')}
                            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                              activeTab === 'output'
                                ? 'bg-[#f9fafb] text-black'
                                : 'text-[#9ca3af] hover:bg-[#111111]'
                            }`}
                          >
                            Output
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('steps')}
                            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                              activeTab === 'steps'
                                ? 'bg-[#f9fafb] text-black'
                                : 'text-[#9ca3af] hover:bg-[#111111]'
                            }`}
                          >
                            Steps
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('questions')}
                            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                              activeTab === 'questions'
                                ? 'bg-[#f9fafb] text-black'
                                : 'text-[#9ca3af] hover:bg-[#111111]'
                            }`}
                          >
                            Questions
                          </button>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'output' && (
                      <div className="flex h-full flex-col gap-4 pt-20 text-sm text-[#e5e7eb]">
                        <div className="relative flex-1">
                          {selectedChat?.isMessagesLoading && allMessages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-xs text-[#6b7280]">
                              Loading chat messages...
                            </div>
                          ) : (
                            <>
                              <div
                                ref={messagesContainerRef}
                                onScroll={handleMessagesScroll}
                                className="scrollbar-hidden absolute inset-0 space-y-4 overflow-y-auto pr-1"
                              >
                                {!selectedChat?.isMessagesLoading &&
                                  allMessages.length === 0 && (
                                    <div className="text-center text-xs text-[#6b7280]">
                                      No messages yet. Ask something to start the conversation.
                                    </div>
                                  )}

                                {allMessages.map((message) => {
                            const { dateLabel, timeLabel } = getDisplayDate(message);

                            if (message.role === 'user') {
                              return (
                                <div key={message.id} className="flex justify-end text-[13px]">
                                  <div className="max-w-[75%] rounded-2xl bg-[#171717] px-3 py-2 text-[#e5e7eb]">
                                    <p className="whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                    <div className="mt-1 text-right text-[10px] text-[#6b7280]">
                                      {dateLabel} • {timeLabel}
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            const sections = parseMarkdownSections(message.content);

                            return (
                              <div key={message.id} className="flex items-start gap-2 text-[13px]">
                                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-[11px] text-[#e5e7eb]">
                                  AI
                                </div>
                                <div className="max-w-[75%] rounded-2xl bg-[#111111] px-3 py-2 text-[#e5e7eb]">
                                  {sections.length > 0 ? (
                                    sections.map((section) => (
                                      <div
                                        key={section.heading || section.paragraphs.join(' ')}
                                        className="space-y-2"
                                      >
                                        {section.heading && (
                                          <h2 className="text-[13px] font-semibold text-[#f9fafb]">
                                            {section.heading}
                                          </h2>
                                        )}
                                        {section.paragraphs.map((paragraph, index) => (
                                          <p
                                            key={index}
                                            className="text-[13px] leading-relaxed text-[#e5e7eb]"
                                          >
                                            {paragraph}
                                          </p>
                                        ))}
                                        {section.items.length > 0 && (
                                          <ul className="list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-[#e5e7eb]">
                                            {section.items.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="whitespace-pre-wrap break-words text-[13px]">
                                      {message.content}
                                    </p>
                                  )}
                                  <div className="mt-1 text-[10px] text-[#6b7280]">
                                    {dateLabel} • {timeLabel}
                                  </div>
                                </div>
                              </div>
                            );
                                })}

                                {selectedChat?.isLoadingMoreMessages && (
                                  <div className="text-center text-[11px] text-[#6b7280]">
                                    Loading earlier messages...
                                  </div>
                                )}

                                {isThinking &&
                                  pendingAssistantChatId === selectedChat?.id &&
                                  currentStreamAssistantId === null && (
                                    <div className="flex items-start gap-2 text-[13px] text-[#9ca3af]">
                                      <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-[11px] text-[#e5e7eb]">
                                        AI
                                      </div>
                                      <div className="max-w-[75%] rounded-2xl bg-[#111111] px-3 py-2">
                                        <p className="whitespace-pre-wrap break-words">
                                          {loadingDots}
                                        </p>
                                        <div className="mt-1 text-[10px] text-[#6b7280]">
                                          {new Date().toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>

                              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#101010] to-transparent" />
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#101010] to-transparent" />
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'steps' && (
                      <div className="space-y-4 text-sm text-[#e5e7eb]">
                        <h2 className="text-sm font-semibold text-[#f9fafb]">Steps</h2>
                        <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-[#9ca3af]">
                          <li>Review recent sales of comparable properties in the same suburb.</li>
                          <li>Inspect the property to confirm condition, layout, and unique features.</li>
                          <li>Adjust for differences in land size, floor area, and renovations.</li>
                          <li>Align pricing with current buyer demand and vendor expectations.</li>
                          <li>Prepare a clear recommendation range for the campaign strategy.</li>
                        </ol>
                      </div>
                    )}

                    {activeTab === 'questions' && (
                      <div className="space-y-4 text-sm text-[#e5e7eb]">
                        <h2 className="text-sm font-semibold text-[#f9fafb]">Questions</h2>
                        <ul className="mt-1 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-[#9ca3af]">
                          <li>How sensitive is buyer demand to small changes in price range here?</li>
                          <li>Which comparable sales should be weighted most heavily for this CMA?</li>
                          <li>What impact do recent renovations have on achievable sale price?</li>
                          <li>How does this property compete with current on-market listings?</li>
                          <li>What auction or campaign strategy best fits this recommendation?</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedChat?.mode !== 'empty' && (
                <div className="mt-4">
                  <div className="mx-auto flex w-full items-center rounded-full bg-[#171717] px-4 py-2 text-sm text-[#6b7280] ring-1 ring-[#18181b]">
                    <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#111111] text-lg leading-none text-[#9ca3af]">
                      +
                    </span>
                    <input
                      type="text"
                      placeholder="Ask something..."
                      className="mr-3 flex-1 bg-transparent text-[13px] text-[#e5e7eb] outline-none placeholder:text-[#6b7280]"
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111]"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isThinking}
                    >
                      <Image
                        src="/assets/chat-send.svg"
                        alt="Send message"
                        width={19}
                        height={19}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
