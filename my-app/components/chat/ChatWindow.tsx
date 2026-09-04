"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Plus, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { ChatMessage } from "./MessageBubble";

interface ChatWindowProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRefreshConversations: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  userName?: string | null;
  conversationTitle?: string;
}

export function ChatWindow({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRefreshConversations,
  onToggleSidebar,
  isSidebarOpen = true,
  userName,
  conversationTitle = "New Chat",
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const justCreatedConvIdRef = useRef<string | null>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setStreamingContent("");
      setIsStreaming(false);
      return;
    }

    // Skip re-fetching if this conversation was just created by the current message
    if (justCreatedConvIdRef.current === activeConversationId) {
      justCreatedConvIdRef.current = null;
      return;
    }

    let isMounted = true;
    setLoadingHistory(true);

    fetch(`/api/conversations/${activeConversationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error("Error loading chat history:", err))
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || isStreaming) return;

    setInput("");

    // Create optimistic user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: text,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server returned error ${res.status}`);
      }

      // Check for returned or created conversation ID
      const returnConvId = res.headers.get("x-conversation-id");
      if (returnConvId && !activeConversationId) {
        justCreatedConvIdRef.current = returnConvId;
        onSelectConversation(returnConvId);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingContent(accumulated);
      }

      // Finalize assistant message
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: accumulated,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
      onRefreshConversations();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Stream aborted by user
        if (streamingContent) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: streamingContent + " *(Stopped)*",
              createdAt: new Date(),
            },
          ]);
        }
      } else {
        console.error("Chat error:", err);
        const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ **Error:** ${errMsg}\n\nPlease check your connection or try again.`,
            createdAt: new Date(),
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerateLast = useCallback(() => {
    if (messages.length === 0 || isStreaming) return;

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserPrompt = messages[lastUserIndex].content;
    // Trim back to before the last user message and re-send
    const trimmed = messages.slice(0, lastUserIndex);
    setMessages(trimmed);
    handleSendMessage(lastUserPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 min-w-0 overflow-hidden relative">
      {/* Top Navigation Bar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar Toggle Button: On desktop, only show when sidebar is collapsed */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`p-2 -ml-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors ${
              isSidebarOpen ? "md:hidden" : ""
            }`}
            title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <Menu className="w-5 h-5 md:hidden" />
            ) : (
              <>
                <PanelLeftOpen className="w-5 h-5 hidden md:block" />
                <Menu className="w-5 h-5 md:hidden" />
              </>
            )}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">
              {activeConversationId ? conversationTitle : "New Conversation"}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/50 text-[11px] font-medium text-violet-600 dark:text-violet-300">
              <Sparkles className="w-3 h-3" />
              <span>Gemini Flash</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      {loadingHistory ? (
        <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading messages...</span>
          </div>
        </div>
      ) : messages.length === 0 && !isStreaming ? (
        <EmptyState onSelectPrompt={handleSendMessage} userName={userName} />
      ) : (
        <MessageList
          messages={messages}
          streamingMessage={streamingContent}
          isStreaming={isStreaming}
          onRegenerateLast={handleRegenerateLast}
        />
      )}

      {/* Input Bar */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSendMessage}
        isStreaming={isStreaming}
        onStop={handleStopGeneration}
      />
    </div>
  );
}
