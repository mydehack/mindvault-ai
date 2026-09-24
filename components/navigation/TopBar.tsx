"use client";

import React from "react";
import { Search, FolderArchive, Calendar, Flame, Bell } from "lucide-react";
import { UserProfile, ThemeMode } from "@/lib/types";
import { DayNightToggle } from "@/components/ui/day-night-toggle";

interface TopBarProps {
  user: UserProfile;
  storageCount: number;
  questCount: number;
  onOpenStorage: () => void;
  onOpenCalendar: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  storageCount,
  questCount,
  onOpenStorage,
  onOpenCalendar,
  onOpenProfile,
  searchQuery,
  onSearchChange,
  currentTheme,
  onThemeChange,
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-vault-border bg-vault-card/75 backdrop-blur-xl px-6 transition-colors duration-300">
      {/* Global Search Bar */}
      <div className="relative w-72 sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Semantic search across goals, vault & notes..."
          className="w-full rounded-xl border border-vault-border bg-slate-900/50 dark:bg-slate-900/50 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Access Storage Icon Button */}
        <button
          onClick={onOpenStorage}
          className="relative flex items-center gap-2 rounded-xl border border-vault-border bg-slate-900/40 hover:bg-slate-800/60 px-3 py-2 text-xs font-medium text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Access Storage & Files"
        >
          <FolderArchive className="size-4 text-cyan-400" />
          <span className="hidden sm:inline">Storage</span>
          <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
            {storageCount}
          </span>
        </button>

        {/* Interactive Calendar Icon Button with Daily Quests */}
        <button
          onClick={onOpenCalendar}
          className="relative flex items-center gap-2 rounded-xl border border-vault-border bg-slate-900/40 hover:bg-slate-800/60 px-3 py-2 text-xs font-medium text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Interactive Calendar & Daily Quests"
        >
          <Calendar className="size-4 text-amber-400" />
          <span className="hidden sm:inline">Calendar</span>
          {questCount > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              <Flame className="size-2.5 fill-amber-400 text-amber-400" />
              {questCount}
            </span>
          )}
        </button>

        {/* Day / Night Mode Toggle Icon */}
        <DayNightToggle theme={currentTheme} onThemeChange={onThemeChange} />

        {/* Profile Avatar Button (Clicking opens ProfileModal) */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 rounded-xl border border-vault-border bg-slate-900/40 p-1 hover:border-indigo-500/50 transition-all hover:scale-105 active:scale-95"
          title="User Profile & Settings"
        >
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="size-8 rounded-lg bg-slate-900 object-contain"
          />
        </button>
      </div>
    </header>
  );
};
