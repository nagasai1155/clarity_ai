"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";

interface ConversationItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ConversationItem({
  id,
  title,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Click outside menu listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleSaveRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editedTitle.trim()) {
      setEditedTitle(title);
      setIsEditing(false);
      return;
    }
    if (editedTitle.trim() !== title) {
      await onRename(id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveRename}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-violet-500/40 my-1"
      >
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditedTitle(title);
              setIsEditing(false);
            }
          }}
          className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none min-w-0"
        />
        <button
          type="submit"
          className="p-1 rounded text-emerald-600 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          title="Save title"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setEditedTitle(title);
            setIsEditing(false);
          }}
          className="p-1 rounded text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer my-0.5 ${
        isActive
          ? "bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-medium border border-violet-200/70 dark:border-violet-800/40"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive ? "text-violet-600 dark:text-violet-400" : "text-neutral-400"
          }`}
        />
        <span className="truncate text-[13.5px]">{title || "Untitled Conversation"}</span>
      </div>

      {/* Action Trigger */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-opacity ${
            showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                setIsEditing(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
