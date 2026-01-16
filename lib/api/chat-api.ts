import { z } from 'zod';
import { apiClient } from './api-client';

const ChatSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.string(),
});

const MessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string(),
  previousMessageId: z.string().nullable().optional(),
});

const PaginatedMessagesSchema = z.object({
  items: z.array(MessageSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

const ChatCreateRequestSchema = z.object({
  title: z.string().optional(),
});

const ChatCreateResultSchema = z.object({
  chat: ChatSchema,
  created: z.boolean(),
});

const ChatListResponseSchema = z.object({
  data: z.array(ChatSchema),
  statusCode: z.number(),
  timestamp: z.string(),
});

const ChatCreateResponseSchema = z.object({
  data: ChatCreateResultSchema,
  statusCode: z.number(),
  timestamp: z.string(),
});

const ChatResponseSchema = z.object({
  data: ChatSchema,
  statusCode: z.number(),
  timestamp: z.string(),
});

const PaginatedMessagesResponseSchema = z.object({
  data: PaginatedMessagesSchema,
  statusCode: z.number(),
  timestamp: z.string(),
});

const StreamChunkSchema = z.object({
  messageId: z.string(),
  previousMessageId: z.string().nullable(),
  chatId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  index: z.number(),
  createdAt: z.string(),
});

const StreamEventSchema = z.object({
  data: StreamChunkSchema,
});

export type Chat = z.infer<typeof ChatSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type PaginatedMessages = z.infer<typeof PaginatedMessagesSchema>;

export type ChatCreateRequest = z.infer<typeof ChatCreateRequestSchema>;
export type ChatCreateResult = z.infer<typeof ChatCreateResultSchema>;

export type ChatListResponse = z.infer<typeof ChatListResponseSchema>;
export type ChatCreateResponse = z.infer<typeof ChatCreateResponseSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export type PaginatedMessagesResponse = z.infer<typeof PaginatedMessagesResponseSchema>;

export type StreamChunk = z.infer<typeof StreamChunkSchema>;
export type StreamEvent = z.infer<typeof StreamEventSchema>;

export type ListMessagesParams = {
  page?: number;
  limit?: number;
  role?: 'user' | 'assistant';
  before?: string;
  after?: string;
  search?: string;
};

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function listChats(): Promise<ChatListResponse> {
  return apiClient.get<ChatListResponse>('/chats', ChatListResponseSchema);
}

async function createChat(payload: ChatCreateRequest = {}): Promise<ChatCreateResponse> {
  return apiClient.post<ChatCreateRequest, ChatCreateResponse>(
    '/chats',
    payload,
    {
      requestSchema: ChatCreateRequestSchema,
      responseSchema: ChatCreateResponseSchema,
    }
  );
}

async function getChat(id: string): Promise<ChatResponse> {
  return apiClient.get<ChatResponse>(`/chats/${id}`, ChatResponseSchema);
}

async function listMessages(
  chatId: string,
  params: ListMessagesParams = {}
): Promise<PaginatedMessagesResponse> {
  const query = buildQuery(params);
  return apiClient.get<PaginatedMessagesResponse>(
    `/chats/${chatId}/messages${query}`,
    PaginatedMessagesResponseSchema
  );
}

async function streamChat(
  chatId: string,
  content: string,
  token: string,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = `${baseUrl}/chats/${chatId}/messages/stream${buildQuery({ content })}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to stream chat');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) {
        continue;
      }

      const match = trimmedBlock.match(/^data:\s?(.*)$/m);
      if (!match || !match[1]) {
        continue;
      }

      const json = match[1].trim();
      if (!json) {
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        continue;
      }

      const result = StreamEventSchema.safeParse(parsed);
      if (!result.success) {
        continue;
      }

      onChunk(result.data.data);
    }
  }
}

export const ChatApi = {
  listChats,
  createChat,
  getChat,
  listMessages,
  streamChat,
};
