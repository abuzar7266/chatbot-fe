import { create } from 'zustand';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  createdAt: string;
  content: string;
  previousMessageId?: string | null;
  source?: string;
};

export type Chat = {
  id: string;
  title: string;
  mode: 'doc' | 'empty';
  messages: ChatMessage[];
  messagesPage?: number;
  hasMoreMessages?: boolean;
  isMessagesLoading?: boolean;
  isLoadingMoreMessages?: boolean;
};

type ChatsUpdater = Chat[] | ((previous: Chat[]) => Chat[]);

interface ChatState {
  chats: Chat[];
  isInitialLoading: boolean;
  setChats: (updater: ChatsUpdater) => void;
  setIsInitialLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>(set => ({
  chats: [],
  isInitialLoading: true,
  setChats: updater =>
    set(state => ({
      chats:
        typeof updater === 'function'
          ? (updater as (previous: Chat[]) => Chat[])(state.chats)
          : updater,
    })),
  setIsInitialLoading: loading => set({ isInitialLoading: loading }),
}));
