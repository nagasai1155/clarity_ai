"use client";

import React from "react";
import { Sparkles, Code, Lightbulb, Compass, MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  userName?: string | null;
}

export function EmptyState({ onSelectPrompt, userName }: EmptyStateProps) {
  const suggestions = [
    {
      title: "Explain a concept",
      desc: "Quantum computing in simple everyday analogies",
      prompt: "Explain quantum computing in simple everyday analogies with examples.",
      icon: Lightbulb,
      color: "text-amber-500",
    },
    {
      title: "Code & Architecture",
      desc: "Write a debounce hook with TypeScript & React",
      prompt: "Write a modern, type-safe debounce hook in TypeScript with usage examples.",
      icon: Code,
      color: "text-blue-500",
    },
    {
      title: "Brainstorm ideas",
      desc: "Growth strategies for a modern SaaS product",
      prompt: "Brainstorm 5 high-impact, organic growth strategies for a modern B2B SaaS product.",
      icon: Compass,
      color: "text-emerald-500",
    },
    {
      title: "Draft communication",
      desc: "Polite email negotiating a project timeline",
      prompt: "Draft a polite and professional email requesting a 3-day extension on a project deadline.",
      icon: MessageSquare,
      color: "text-violet-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full text-center">
      {/* Brand Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 p-[2px] shadow-lg mb-6 shadow-violet-500/10">
        <div className="w-full h-full rounded-[14px] bg-white dark:bg-neutral-900 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
        {userName ? `Welcome back, ${userName.split(" ")[0]}!` : "What can I help you with today?"}
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base max-w-md mb-8">
        Powered by Google Gemini. Ask anything, brainstorm ideas, analyze code, or draft content in real time.
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-violet-300 dark:hover:border-violet-700/60 transition-all duration-200 group flex items-start gap-3 shadow-xs cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 group-hover:scale-105 transition-transform">
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-0.5">
                  {item.title}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
