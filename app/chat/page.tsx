'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  createdAt: string;
  content: string;
};

type Chat = {
  id: string;
  title: string;
  mode: 'doc' | 'empty';
  messages: ChatMessage[];
};

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

const assistantSampleResponses: string[] = [
  [
    '## Executive Summary and Property Overview',
    '',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
  ].join('\n'),
  [
    '## Market Snapshot',
    '',
    'Buyer demand remains resilient in core suburbs while fringe locations are experiencing slightly longer days on market.',
  ].join('\n'),
  [
    '## Key Opportunities',
    '',
    '- Well-presented family homes in school zones.',
    '- Low-maintenance townhouses close to public transport.',
    '- Renovated character properties with modern upgrades.',
  ].join('\n'),
  [
    '## Risk Considerations',
    '',
    '- Sensitivity to small interest rate movements.',
    '- Shifts in lending criteria for investors.',
    '- Localised oversupply in some new-build segments.',
  ].join('\n'),
  [
    '## Pricing Strategy',
    '',
    'Position the guide in line with recent comparable sales while allowing room for competitive bidding to establish the final price.',
  ].join('\n'),
  [
    '## Campaign Overview',
    '',
    '- Two-week pre-launch preparation.',
    '- Three-week auction campaign.',
    '- Targeted digital marketing and buyer follow-up.',
  ].join('\n'),
  [
    '## Buyer Profile',
    '',
    '- Upsizing families seeking more space.',
    '- Professional couples wanting proximity to the CBD.',
    '- Downsizers looking for low-maintenance living.',
  ].join('\n'),
  [
    '## Vendor Considerations',
    '',
    'Clarify preferred timeframes, minimum acceptable outcomes, and any flexibility around settlement dates before launching the campaign.',
  ].join('\n'),
  [
    '## Local Insights',
    '',
    'Recent infrastructure upgrades and amenity improvements are supporting long-term value in this catchment.',
  ].join('\n'),
  [
    '## Recommendation',
    '',
    'Proceed with a well-structured auction campaign supported by strong digital and database marketing to maximise competition.',
  ].join('\n'),
  [
    '## Comparable Sales Summary',
    '',
    '- 4 Example Street: modernised 3-bedroom home sold above expectation.',
    '- 18 Sample Avenue: similar land size with updated kitchen and bathrooms.',
    '- 27 Demo Road: original condition, sold with fewer bidders and a softer result.',
  ].join('\n'),
  [
    '## Short Summary',
    '',
    'Overall conditions are balanced, with quality listings attracting strong enquiry and secondary stock requiring sharper pricing.',
  ].join('\n'),
  [
    '## Marketing Message',
    '',
    'Highlight natural light, indoor–outdoor flow, and proximity to key amenities to connect with the strongest buyer segments.',
  ].join('\n'),
  [
    '## Negotiation Notes',
    '',
    'Focus on buyer motivation, finance readiness, and any flexibility on settlement when working pre-auction offers.',
  ].join('\n'),
  [
    '## Next Actions',
    '',
    '- Finalise photography and floor plans.',
    '- Confirm auction date and reserve range.',
    '- Prepare data-backed talking points for open homes.',
  ].join('\n'),
  [
    '## Vendor Update Template',
    '',
    '- Number of enquiries this week.',
    '- Open home attendance and buyer feedback.',
    '- Any emerging offers or strong interest.',
  ].join('\n'),
  [
    '## Open Home Briefing',
    '',
    'Emphasise recent sales, local amenities, and the property’s key points of difference at every inspection.',
  ].join('\n'),
  [
    '## Area Overview',
    '',
    'The suburb continues to attract long-term owner-occupiers, with strong engagement from buyers moving within the area.',
  ].join('\n'),
  [
    '## Campaign Health Check',
    '',
    'Enquiry levels, inspection numbers, and offer activity all indicate a well-positioned listing at this stage.',
  ].join('\n'),
  [
    '## Short CMA-style Note',
    '',
    'Based on comparable sales and current demand, the property sits comfortably within the recommended pricing band for this pocket.',
  ].join('\n'),
];

const initialChats: Chat[] = [
  {
    id: '1',
    title: 'New chat',
    mode: 'empty',
    messages: [],
  },
  {
    id: '2',
    title: 'Write a CMA for 123 Rise Road, Remuera, Auckland',
    mode: 'doc',
    messages: [
      {
        id: 'm1',
        role: 'user',
        createdAt: '2025-01-15T09:00:00.000Z',
        content:
          'Can you write a CMA summary for 123 Rise Road, Remuera, Auckland, including key features and a short overview?',
      },
      {
        id: 'm2',
        role: 'assistant',
        createdAt: '2025-01-15T09:00:05.000Z',
        content: [
          '## Executive Summary and Property Overview',
          '',
          'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
          '',
          '## Property Analysis and Physical Inspection Dhetails',
          '',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          '',
          '## Property Features',
          '',
          '- Bedrooms: 3 total - 1 master with ensuite, 2 standard double bedrooms.',
          '- Bathrooms: 2 bathrooms - 1 main, 1 ensuite (both with modern fittings).',
          '- Living areas: Open-plan lounge and dining area with northeast sunny nook.',
          '- Special rooms: Dedicated home office and separate laundry room.',
          '- Floor area: 156m² (not measured), with 2.7m ceiling height throughout.',
          '- Land area: 746m² (freehold title), fully fenced.',
        ].join('\n'),
      },
      {
        id: 'm3',
        role: 'user',
        createdAt: '2025-01-15T09:01:10.000Z',
        content:
          'Can you also outline the high-level steps you used to arrive at this CMA?',
      },
      {
        id: 'm4',
        role: 'assistant',
        createdAt: '2025-01-15T09:01:15.000Z',
        content: [
          '## Steps Used for the CMA',
          '',
          '- Reviewed recent sales of comparable properties in the same suburb.',
          '- Adjusted for differences in land size, floor area, and condition.',
          '- Considered the impact of renovations and unique features.',
          '- Benchmarked against current on-market listings and buyer demand.',
          '- Formulated a pricing recommendation range and campaign strategy.',
        ].join('\n'),
      },
    ],
  },
  {
    id: '3',
    title: 'Explore the latest shifts in the market',
    mode: 'doc',
    messages: [
      {
        id: 'm1',
        role: 'user',
        createdAt: '2025-01-14T10:00:00.000Z',
        content: 'Summarise the latest shifts in the Auckland residential market.',
      },
      {
        id: 'm2',
        role: 'assistant',
        createdAt: '2025-01-14T10:00:06.000Z',
        content: [
          '## Market Overview',
          '',
          'Buyer demand has softened slightly at the upper end of the market while first-home buyer activity has stabilised.',
          '',
          '## Key Shifts',
          '',
          '- Slight increase in days on market across most suburbs.',
          '- Vendors are more price-sensitive and open to pre-auction offers.',
          '- Well-presented, renovated properties continue to attract strong competition.',
        ].join('\n'),
      },
    ],
  },
  {
    id: '4',
    title: 'Dive into the recent development pipeline',
    mode: 'doc',
    messages: [
      {
        id: 'm1',
        role: 'user',
        createdAt: '2025-01-13T08:30:00.000Z',
        content:
          'Give me an overview of the recent development pipeline for this area.',
      },
      {
        id: 'm2',
        role: 'assistant',
        createdAt: '2025-01-13T08:30:06.000Z',
        content: [
          '## Development Pipeline Snapshot',
          '',
          'New townhouse and apartment projects are concentrated around transport hubs and town centres.',
          '',
          '## Notable Projects',
          '',
          '- Medium-density townhouse developments near key rail corridors.',
          '- Mixed-use projects that combine retail, office, and residential units.',
          '- Upgrades to local infrastructure supporting higher dwelling capacity.',
        ].join('\n'),
      },
    ],
  },
  {
    id: '5',
    title: 'Analyze the current market sentiment',
    mode: 'doc',
    messages: [
      {
        id: 'm1',
        role: 'user',
        createdAt: '2025-01-12T11:15:00.000Z',
        content:
          'What is the current buyer and seller sentiment in this market?',
      },
      {
        id: 'm2',
        role: 'assistant',
        createdAt: '2025-01-12T11:15:06.000Z',
        content: [
          '## Buyer Sentiment',
          '',
          '- Cautiously optimistic, with a focus on value and quality.',
          '- More interest in lock-and-leave, low-maintenance properties.',
          '',
          '## Seller Sentiment',
          '',
          '- Motivated vendors are realistic about pricing.',
          '- Some discretionary sellers are choosing to wait for more certainty.',
        ].join('\n'),
      },
    ],
  },
  {
    id: '6',
    title: 'Investigate the evolving market dynamics',
    mode: 'doc',
    messages: [
      {
        id: 'm1',
        role: 'user',
        createdAt: '2025-01-11T14:20:00.000Z',
        content: 'What dynamics are evolving in this market over the next 6–12 months?',
      },
      {
        id: 'm2',
        role: 'assistant',
        createdAt: '2025-01-11T14:20:05.000Z',
        content: [
          '## Evolving Dynamics',
          '',
          '- Gradual normalisation of interest rates from recent peaks.',
          '- Increased focus on energy-efficient and future-proofed homes.',
          '- Ongoing tension between land supply and zoning constraints.',
        ].join('\n'),
      },
    ],
  },
  {
    id: '7',
    title: 'Review the latest market trends',
    mode: 'doc',
    messages: [
      {
        id: 'm1',
        role: 'user',
        createdAt: '2025-01-10T16:45:00.000Z',
        content: 'Summarise the latest broad market trends I should be aware of.',
      },
      {
        id: 'm2',
        role: 'assistant',
        createdAt: '2025-01-10T16:45:06.000Z',
        content: [
          '## Latest Trends',
          '',
          '- Stable listing volumes with modest quarterly growth.',
          '- Premium suburbs holding value better than fringe locations.',
          '- Increased use of digital marketing and virtual inspections.',
        ].join('\n'),
      },
    ],
  },
];

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<string>(initialChats[0]?.id ?? '1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'steps' | 'questions'>('output');

  const [inputValue, setInputValue] = useState('');
  const [assistantResponseIndex, setAssistantResponseIndex] = useState(0);
  const [pendingAssistantText, setPendingAssistantText] = useState<string | null>(null);
  const [pendingAssistantChatId, setPendingAssistantChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [loadingDots, setLoadingDots] = useState('...');
  const [pendingTitleChatId, setPendingTitleChatId] = useState<string | null>(null);
  const [pendingTitleValue, setPendingTitleValue] = useState<string | null>(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? chats[0];
  const allMessages = selectedChat?.messages ?? [];

  useEffect(() => {
    if (!pendingAssistantText || !pendingAssistantChatId) {
      return;
    }

    let cancelled = false;
    setIsThinking(true);
    setStreamedText('');

    const delayTimeout = setTimeout(() => {
      if (cancelled) {
        return;
      }

      setIsThinking(false);

      const words = pendingAssistantText.split(' ');
      let index = 0;

      const interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }

        index += 1;
        const text = words.slice(0, index).join(' ');
        setStreamedText(text);

        if (index >= words.length) {
          clearInterval(interval);

          const finalContent = pendingAssistantText;

          const assistantMessage: ChatMessage = {
            id: `a-${Date.now().toString()}`,
            role: 'assistant',
            createdAt: new Date().toISOString(),
            content: finalContent,
          };

          setChats((previous) =>
            previous.map((chat) => {
              if (chat.id !== pendingAssistantChatId) {
                return chat;
              }

              const nextMessages: ChatMessage[] = [...chat.messages, assistantMessage];

              const shouldApplyTitle =
                pendingTitleChatId === chat.id && pendingTitleValue && chat.title === 'New chat';

              const nextTitle =
                shouldApplyTitle && pendingTitleValue ? pendingTitleValue : chat.title;

              return {
                ...chat,
                mode: chat.mode === 'empty' ? 'doc' : chat.mode,
                title: nextTitle,
                messages: nextMessages,
              };
            })
          );

          if (pendingTitleChatId === pendingAssistantChatId && pendingTitleValue) {
            setPendingTitleChatId(null);
            setPendingTitleValue(null);
          }

          setPendingAssistantText(null);
          setPendingAssistantChatId(null);
          setStreamedText('');
        }
      }, 80);

      return () => {
        clearInterval(interval);
      };
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(delayTimeout);
    };
  }, [pendingAssistantText, pendingAssistantChatId, pendingTitleChatId, pendingTitleValue, setChats]);

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

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New chat',
      mode: 'empty',
      messages: [],
    };

    setChats((previous) => [newChat, ...previous]);
    setSelectedChatId(newChat.id);
  };

  const handleSendMessage = () => {
    if (!selectedChat) {
      return;
    }

    const trimmed = inputValue.trim();

    if (!trimmed || isThinking || pendingAssistantText) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now().toString()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      content: trimmed,
    };

    const isFirstMessageInEmptyChat =
      selectedChat.mode === 'empty' && selectedChat.messages.length === 0;

    const randomIndex = Math.floor(Math.random() * assistantSampleResponses.length);

    const responseIndex = isFirstMessageInEmptyChat
      ? randomIndex
      : assistantResponseIndex % assistantSampleResponses.length;

    const responseTemplate = assistantSampleResponses[responseIndex];

    const deriveTitleFromResponse = (markdown: string) => {
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

    if (isFirstMessageInEmptyChat) {
      const derivedTitle = deriveTitleFromResponse(responseTemplate);
      setPendingTitleChatId(selectedChat.id);
      setPendingTitleValue(derivedTitle);
    }

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
    setAssistantResponseIndex((previous) => previous + 1);
    setPendingAssistantChatId(selectedChat.id);
    setPendingAssistantText(responseTemplate);
    setActiveTab('output');
  };

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
                  className="flex items-center gap-3 rounded-md px-0 py-1.5 hover:bg-[#111111]"
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
                  className="flex items-center gap-3 rounded-md px-0 py-1.5 hover:bg-[#111111]"
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
                  className="flex items-center gap-3 rounded-md px-0 py-1.5 hover:bg-[#111111]"
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
                  className="flex items-center gap-3 rounded-md px-0 py-1.5 hover:bg-[#111111]"
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
                {chats.map((chat) => {
                  const isActive = chat.id === selectedChatId;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${
                        isActive ? 'bg-[#525252] text-[#f9fafb]' : 'hover:bg-[#050815]'
                      }`}
                    >
                      <span className="line-clamp-1 text-xs">{chat.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-[#18181b] pt-4 text-[11px] text-[#9ca3af]">
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#111111]">
                  <Image
                    src="/assets/auth-logo.png"
                    alt="User avatar"
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#e5e7eb]">John Smith</span>
                  <span className="text-[10px] text-[#6b7280]">johnsmith@email.com</span>
                </div>
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

                <nav className="mt-6 space-y-4 text-xs text-[#6b7280]">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-[#111111] text-[#e5e7eb]"
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
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-[#6b7280] hover:bg-[#111111]"
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
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-[#6b7280] hover:bg-[#111111]"
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
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-[#6b7280] hover:bg-[#111111]"
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

              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#111111]">
                <Image
                  src="/assets/auth-logo.png"
                  alt="User avatar"
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-contain"
                />
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
              {selectedChat?.mode === 'empty' ? (
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
                          disabled={!inputValue.trim() || isThinking || pendingAssistantText !== null}
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
                          <div className="scrollbar-hidden absolute inset-0 space-y-4 overflow-y-auto pr-1">
                            {allMessages.length === 0 && (
                              <div className="text-center text-xs text-[#6b7280]">
                                No messages yet. Ask something to start the conversation.
                              </div>
                            )}

                            {allMessages.map((message) => {
                            const createdAtDate = new Date(message.createdAt);
                            const dateLabel = createdAtDate.toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                            const timeLabel = createdAtDate.toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            });

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

                            {(isThinking || streamedText) &&
                              pendingAssistantChatId === selectedChat?.id && (
                                <div className="flex items-start gap-2 text-[13px] text-[#9ca3af]">
                                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-[11px] text-[#e5e7eb]">
                                    AI
                                  </div>
                                  <div className="max-w-[75%] rounded-2xl bg-[#111111] px-3 py-2">
                                    <p className="whitespace-pre-wrap break-words">
                                      {isThinking ? loadingDots : streamedText}
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
            </div>
          </div>

          {selectedChat?.mode !== 'empty' && (
            <div className="border-t border-[#18181b] px-6 pb-6 pt-4 bg-[#101010]">
              <div className="mx-auto flex w-full max-w-4xl items-center rounded-full bg-[#171717] px-4 py-2 text-sm text-[#6b7280] ring-1 ring-[#18181b]">
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
                  disabled={!inputValue.trim() || isThinking || pendingAssistantText !== null}
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
        </section>
      </div>
    </main>
  );
}
