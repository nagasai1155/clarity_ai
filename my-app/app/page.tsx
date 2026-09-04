"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Sidebar, ConversationSummary } from "@/components/sidebar/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  const { data: session, status } = useSession();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load user conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, []);

  useEffect(() => {
    if (session || isDemoMode) {
      loadConversations();
    }
  }, [session, isDemoMode, loadConversations]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // Loading session spinner
  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading Clarity AI...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated and not in demo mode -> Landing Page
  if (!session && !isDemoMode) {
    return <LandingPage onExploreDemo={() => setIsDemoMode(true)} />;
  }

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const currentUser = session?.user || {
    name: "Guest Explorer",
    email: "demo@clarity.ai",
    image: null,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        user={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Chat Interface */}
      <ChatWindow
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRefreshConversations={loadConversations}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        userName={currentUser.name}
        conversationTitle={activeConv?.title}
      />
    </div>
  );
}
