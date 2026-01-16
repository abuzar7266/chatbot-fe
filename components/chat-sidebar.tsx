import Image from 'next/image';
import type { Chat } from '@/store/chat-store';

export type ChatSidebarProps = {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  chats: Chat[];
  selectedChat: Chat | undefined;
  initials: string;
  displayName: string;
  displayEmail: string;
  isProfileMenuOpen: boolean;
  onToggleProfileMenu: () => void;
  onLogout: () => void;
};

function ChatSidebar({
  isSidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
  onNewChat,
  onSelectChat,
  chats,
  selectedChat,
  initials,
  displayName,
  displayEmail,
  isProfileMenuOpen,
  onToggleProfileMenu,
  onLogout,
}: ChatSidebarProps) {
  return (
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
              onClick={onOpenSidebar}
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
              onClick={onCloseSidebar}
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
              onClick={onNewChat}
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
              .filter((chat) => {
                const isDefaultEmptyChat =
                  (chat.title || '').trim().toLowerCase() === 'new chat' &&
                  chat.mode === 'empty' &&
                  (chat.messages?.length ?? 0) === 0;

                if (!isDefaultEmptyChat) {
                  return true;
                }

                return chat.id === selectedChat?.id;
              })
              .map((chat) => {
                const isActive = chat.id === selectedChat?.id;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => {
                      onSelectChat(chat.id);
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
              onClick={onToggleProfileMenu}
              className="flex w-full items-center gap-2 rounded-md px-1 py-1 hover:bg-[#111111]"
            >
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-[10px] font-semibold uppercase text-[#e5e7eb]">
                {initials || displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-[#e5e7eb]">
                  {displayName}
                </span>
                {displayEmail && (
                  <span className="text-[10px] text-[#6b7280]">{displayEmail}</span>
                )}
              </div>
            </button>
            {isProfileMenuOpen && (
              <div className="absolute bottom-10 left-0 z-20 w-40 rounded-md border border-[#27272a] bg-[#18181b] py-1 text-xs text-[#e5e7eb] shadow-lg">
                <button
                  type="button"
                  onClick={onLogout}
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
                onClick={onOpenSidebar}
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
  );
}

export default ChatSidebar;

