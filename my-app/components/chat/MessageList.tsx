"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { MessageBubble, ChatMessage } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  streamingMessage?: string | null;
  isStreaming?: boolean;
  onRegenerateLast?: () => void;
}

export function MessageList({
  messages,
  streamingMessage,
  isStreaming = false,
  onRegenerateLast,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isUserScrolledUpRef = useRef(false);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isScrolledUp = distanceFromBottom > 100;
    isUserScrolledUpRef.current = isScrolledUp;
    setShowScrollBottom(isScrolledUp);
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
      isUserScrolledUpRef.current = false;
      setShowScrollBottom(false);
    }
  };

  // Auto-scroll when messages or streaming tokens update (only if user hasn't scrolled up)
  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      scrollToBottom(false);
    }
  }, [messages, streamingMessage]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-2 md:px-4 py-6 scroll-smooth"
    >
      <div className="space-y-2">
        {messages.map((msg, index) => {
          const isLastAssistant =
            index === messages.length - 1 && msg.role === "assistant";

          return (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              onRegenerate={isLastAssistant && !isStreaming ? onRegenerateLast : undefined}
            />
          );
        })}

        {/* Live streaming message bubble */}
        {isStreaming && streamingMessage !== undefined && streamingMessage !== null && (
          <MessageBubble
            message={{
              id: "streaming-response",
              role: "assistant",
              content: streamingMessage,
            }}
            isStreaming={true}
          />
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Floating scroll to bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          type="button"
          aria-label="Scroll to latest message"
          className="fixed bottom-24 right-8 z-20 p-2.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
