"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (text?: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  maxLength?: number;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isStreaming,
  onStop,
  maxLength = 4000,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 200);
    el.style.height = `${Math.max(44, nextHeight)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        const text = input;
        onSubmit(text);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      onStop();
    } else if (input.trim()) {
      const text = input;
      onSubmit(text);
    }
  };

  const charCount = input.length;
  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Streaming Stop Button Banner */}
      {isStreaming && (
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-md hover:opacity-90 transition-opacity"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop generating</span>
          </button>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="relative">
        <div className="relative flex flex-col w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-sm focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={
              isStreaming
                ? "Gemini is thinking..."
                : "Ask Gemini anything... (Enter to send, Shift+Enter for new line)"
            }
            className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[15px] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none disabled:opacity-50 leading-relaxed max-h-[200px]"
          />

          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            {/* Guardrail / Character Counter */}
            <div className="text-[11px] text-neutral-400 font-mono">
              {charCount > 100 && (
                <span className={isOverLimit ? "text-rose-500 font-bold" : isNearLimit ? "text-amber-500" : ""}>
                  {charCount}/{maxLength}
                </span>
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-1.5">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
                  title="Stop generating"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || isOverLimit}
                  className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white disabled:text-neutral-400 dark:disabled:text-neutral-600 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
