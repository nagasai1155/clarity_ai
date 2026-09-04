"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle color theme"
      className={`p-2 rounded-xl transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center justify-center ${className}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
