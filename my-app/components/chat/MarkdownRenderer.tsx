"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-900 text-neutral-100 shadow-sm text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/70 border-b border-neutral-800 text-xs text-neutral-400 font-mono">
        <span className="uppercase tracking-wider font-semibold text-neutral-300">
          {language || "code"}
        </span>
        <button
          onClick={onCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-neutral-800 text-neutral-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-sm leading-relaxed">
        <code>{value}</code>
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeText = String(children).replace(/\n$/, "");
            const isInline = !match && !codeText.includes("\n");

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800/70 text-violet-600 dark:text-violet-300 font-mono text-[13px]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : ""}
                value={codeText}
              />
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-7">{children}</p>;
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-3 text-neutral-900 dark:text-neutral-100">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold mt-5 mb-2.5 text-neutral-900 dark:text-neutral-100">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-medium mt-4 mb-2 text-neutral-900 dark:text-neutral-100">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return (
              <ul className="list-disc pl-5 mb-3 space-y-1 text-neutral-800 dark:text-neutral-200">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal pl-5 mb-3 space-y-1 text-neutral-800 dark:text-neutral-200">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="leading-6">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-violet-500/50 pl-4 py-1 italic my-3 text-neutral-600 dark:text-neutral-300 bg-violet-50/30 dark:bg-violet-950/20 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-left text-sm divide-y divide-neutral-200 dark:divide-neutral-800">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 font-semibold text-neutral-800 dark:text-neutral-200">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300">
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 underline decoration-violet-400/50 hover:decoration-violet-600 dark:hover:decoration-violet-300 transition-colors"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
