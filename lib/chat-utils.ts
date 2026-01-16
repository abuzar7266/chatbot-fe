import type { ChatMessage } from '@/store/chat-store';

export type ParsedSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

export const parseMarkdownSections = (markdown: string): ParsedSection[] => {
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

export const getDisplayDate = (message: ChatMessage) => {
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

export const deriveTitleFromResponse = (markdown: string): string => {
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

