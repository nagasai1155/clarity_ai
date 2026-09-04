"use client";

import React, { useState } from "react";
import { Plus, Sparkles, LogOut, Search, X, PanelLeftClose } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signOut } from "next-auth/react";

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string | Date;
}

interface SidebarProps {
  conversations: ConversationSummary[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSidebar?: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  user,
  isOpen,
  onClose,
  onToggleSidebar,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-neutral-50/95 dark:bg-neutral-900/95 border-r border-neutral-200/80 dark:border-neutral-800 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-72 translate-x-0 opacity-100 shadow-2xl md:shadow-none"
            : "w-0 -translate-x-full md:translate-x-0 md:w-0 opacity-0 border-r-0 overflow-hidden pointer-events-none"
        }`}
      >
        <div className="w-72 flex flex-col h-full shrink-0">
          {/* Header / Brand */}
          <div className="flex items-center justify-between p-3.5 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-xs">
                <div className="w-full h-full rounded-[10px] bg-white dark:bg-neutral-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                  Clarity AI
                </span>
                <span className="block text-[10px] text-neutral-400 font-mono leading-none">
                  Gemini
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4 hidden md:block" />
                <X className="w-4 h-4 md:hidden" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-all duration-150 shadow-xs shadow-violet-600/20 active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Bar */}
          {conversations.length > 3 && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-750 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Recent Chats
            </div>

            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-neutral-400">
                {conversations.length === 0
                  ? "No chat history yet"
                  : "No matching conversations"}
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  id={conv.id}
                  title={conv.title}
                  isActive={conv.id === activeConversationId}
                  onSelect={() => {
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  onRename={onRenameConversation}
                  onDelete={onDeleteConversation}
                />
              ))
            )}
          </div>

          {/* Footer: User Profile & Actions */}
          <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between gap-2">
              {/* User Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-violet-200 dark:border-violet-800">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    {user?.name || "Anonymous User"}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {user?.email || "Demo Session"}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  type="button"
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
