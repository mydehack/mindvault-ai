"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Brain,
  Bot,
  Video,
  BarChart3,
  Calendar,
  FolderArchive,
  PlusCircle,
  Flame,
  Award,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { UserProfile, ThemeMode } from "@/lib/types";
import { DayNightToggle } from "@/components/ui/day-night-toggle";

export type NavView = "dashboard" | "planner" | "vault" | "mentor" | "video" | "analytics";

interface VerticalSidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  user: UserProfile;
  storageCount: number;
  questCount: number;
  onOpenStorage: () => void;
  onOpenCalendar: () => void;
  onOpenProfile: () => void;
  onNewGoal: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const VerticalSidebar: React.FC<VerticalSidebarProps> = ({
  activeView,
  onSelectView,
  user,
  storageCount,
  questCount,
  onOpenStorage,
  onOpenCalendar,
  onOpenProfile,
  onNewGoal,
  currentTheme,
  onThemeChange,
}) => {
  const navItems = [
    { id: "dashboard" as NavView, label: "Overview", icon: LayoutDashboard },
    { id: "planner" as NavView, label: "Goal-to-Action", icon: Target },
    { id: "vault" as NavView, label: "Memory Vault", icon: Brain },
    { id: "mentor" as NavView, label: "AI Mentor", icon: Bot },
    { id: "video" as NavView, label: "Lecture Lab", icon: Video },
    { id: "analytics" as NavView, label: "Analytics & XP", icon: BarChart3 },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 flex flex-col justify-between border-r border-vault-border bg-vault-card/90 backdrop-blur-2xl p-4 z-30 transition-colors duration-300">
      {/* Top Header Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/25">
            <div className="flex items-center justify-center size-full rounded-xl bg-slate-950/80">
              <Brain className="size-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-base tracking-tight text-foreground">
              <span>MindVault</span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/30">
                AI
              </span>
            </div>
            <div className="text-[11px] text-foreground/50 font-medium">Knowledge & Goal OS</div>
          </div>
        </div>

        {/* Quick Goal Action */}
        <button
          onClick={onNewGoal}
          className="group flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-indigo-600/90 to-violet-600/90 hover:from-indigo-600 hover:to-violet-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <PlusCircle className="size-4" />
            <span>Create New Goal</span>
          </div>
          <ChevronRight className="size-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Navigation Items (Vertical) */}
        <nav className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/30 shadow-sm"
                    : "text-foreground/70 hover:bg-slate-800/40 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-indigo-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`size-4 ${isActive ? "text-indigo-400" : "text-foreground/60 group-hover:text-foreground"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Tools & Modals */}
        <div className="space-y-1 pt-2 border-t border-vault-border">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
            Vault Tools
          </div>

          {/* Access Storage Button with Active File Counter */}
          <button
            onClick={onOpenStorage}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground/75 hover:bg-slate-800/40 hover:text-foreground transition-all"
          >
            <div className="flex items-center gap-2.5">
              <FolderArchive className="size-4 text-cyan-400" />
              <span>Storage Vault</span>
            </div>
            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
              {storageCount} files
            </span>
          </button>

          {/* Interactive Calendar Button with Daily Quests Badge */}
          <button
            onClick={onOpenCalendar}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground/75 hover:bg-slate-800/40 hover:text-foreground transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="size-4 text-amber-400" />
              <span>Daily Quests</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              <Flame className="size-3 text-amber-400 fill-amber-400" />
              {questCount} left
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Profile & Theme Section */}
      <div className="pt-4 border-t border-vault-border space-y-3">
        {/* Streak and XP mini stats */}
        <div className="grid grid-cols-2 gap-2 px-1">
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 text-[11px] text-amber-300 font-semibold">
            <Flame className="size-3.5 fill-amber-400 text-amber-400" />
            <span>{user.currentStreak}d Streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-1.5 text-[11px] text-indigo-300 font-semibold">
            <Award className="size-3.5 text-indigo-400" />
            <span>{user.totalXp} XP</span>
          </div>
        </div>

        {/* User Profile Badge (Clicking opens ProfileModal) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-slate-800/50 transition-all flex-1 min-w-0"
            title="Open Profile Modal"
          >
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="size-9 rounded-xl border border-vault-border bg-slate-900/60 p-0.5"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-foreground truncate">{user.fullName}</div>
              <div className="text-[10px] text-foreground/50 truncate">{user.role}</div>
            </div>
          </button>

          {/* Theme Toggle Button */}
          <DayNightToggle theme={currentTheme} onThemeChange={onThemeChange} />
        </div>
      </div>
    </aside>
  );
};
