"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, Zap, Database, Shield, Code2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface LandingPageProps {
  onExploreDemo?: () => void;
}

export function LandingPage({ onExploreDemo }: LandingPageProps) {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col selection:bg-violet-500/20">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-sm">
            <div className="w-full h-full rounded-[10px] bg-white dark:bg-neutral-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight">Clarity AI</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs md:text-sm font-medium transition-all shadow-xs"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/70 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 text-xs font-medium text-violet-700 dark:text-violet-300 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Google Gemini 2.5</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6 leading-[1.15]">
          Thinking and creating with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            unmatched clarity.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          Experience ultra-responsive token-by-token streaming, full chat history persistence in MySQL, syntax-highlighted code generation, and modern aesthetics.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          {/* Continue with Google */}
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-violet-500 dark:hover:border-violet-600 text-neutral-800 dark:text-neutral-200 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Preview */}
          {onExploreDemo && (
            <button
              onClick={onExploreDemo}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-violet-600/25 cursor-pointer group"
            >
              <span>Explore Chat Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full text-left">
          <div className="p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold mb-1">Instant Streaming</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Real-time token responses without blocking loaders or awkward delays.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold mb-1">MySQL Persistence</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Full chat history with auto-titling and cascade-safe deletion.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
              <Code2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold mb-1">Code & Markdown</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Formatted code blocks with one-click copy and clean syntax styling.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold mb-1">Secure NextAuth</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Google OAuth authentication with encrypted sessions and route safety.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200/60 dark:border-neutral-800/60 text-center text-xs text-neutral-400">
        Clarity AI • Built with Next.js 15, Tailwind CSS, Prisma & Google Gemini
      </footer>
    </div>
  );
}
