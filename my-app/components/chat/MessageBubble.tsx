"use client";

import React, { useState } from "react";
import { Bot, Check, Copy, RotateCcw, User } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string | Date;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export function MessageBubble({
  message,
  isStreaming = false,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message", err);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-4 group">
        <div className="flex items-start gap-2.5 max-w-[85%] md:max-w-[75%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300">
            <User className="w-4 h-4" />
          </div>
          <div className="relative">
            <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60 shadow-xs leading-relaxed text-[15px] whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className="flex items-center justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyMessage}
                type="button"
                aria-label="Copy prompt"
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-6 px-4 group">
      <div className="flex items-start gap-3.5 max-w-[95%] md:max-w-[85%] w-full">
        {/* Gemini Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 p-[1.5px] shrink-0 shadow-sm">
          <div className="w-full h-full rounded-[10px] bg-white dark:bg-neutral-900 flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        {/* Assistant Content */}
        <div className="flex-1 min-w-0">
          <div className="text-neutral-900 dark:text-neutral-100 min-h-[1.5rem]">
            <MarkdownRenderer content={message.content} />
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-violet-600 dark:bg-violet-400 animate-pulse align-middle rounded-full" />
            )}
          </div>

          {/* Action Toolbar */}
          {!isStreaming && message.content.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-2 text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/40">
              <button
                onClick={copyMessage}
                type="button"
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  type="button"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
