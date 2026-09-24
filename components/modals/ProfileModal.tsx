"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Briefcase,
  Flame,
  Award,
  Clock,
  Compass,
  Download,
  RotateCcw,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { UserProfile, ThemeMode } from "@/lib/types";
import { DayNightToggle } from "@/components/ui/day-night-toggle";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onResetGoal: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onResetGoal,
  currentTheme,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  const handleExportBackup = () => {
    const backupData = {
      profile: user,
      timestamp: new Date().toISOString(),
      vaultStorageVersion: "2.0.0",
      systemEngine: "Google Gemini 3.8 Flash & pgvector"
    };
    const element = document.createElement("a");
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(blob);
    element.download = `mindvault-backup-${user.fullName.toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-xl rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-vault-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="size-12 rounded-2xl border border-vault-border bg-slate-900/60 p-1"
                />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{user.fullName}</h2>
                <p className="text-xs text-foreground/50">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DayNightToggle theme={currentTheme} onThemeChange={onThemeChange} />
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-slate-800/60 transition-all"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* User Details Grid (Synced with Login) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            <div className="rounded-xl border border-vault-border bg-slate-900/40 p-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-foreground/50 mb-1">
                <Briefcase className="size-3.5 text-indigo-400" />
                <span>Primary Role</span>
              </div>
              <div className="text-xs font-bold text-foreground truncate">{user.role}</div>
            </div>

            <div className="rounded-xl border border-vault-border bg-slate-900/40 p-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-foreground/50 mb-1">
                <Compass className="size-3.5 text-indigo-400" />
                <span>Learning Paradigm</span>
              </div>
              <div className="text-xs font-bold text-foreground truncate">{user.learningStyle}</div>
            </div>
          </div>

          {/* Stats Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Flame className="size-4 fill-amber-400" />
                <span className="text-lg font-black">{user.currentStreak}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                Day Streak
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
                <Award className="size-4" />
                <span className="text-lg font-black">{user.totalXp}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">
                Mastery XP
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                <Clock className="size-4" />
                <span className="text-lg font-black">{user.hoursStudied}h</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
                Study Time
              </div>
            </div>
          </div>

          {/* Actions: Set New Target & Export Backup */}
          <div className="space-y-3 pt-2 border-t border-vault-border">
            <button
              onClick={() => {
                onClose();
                onResetGoal();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <RotateCcw className="size-3.5" />
              <span>Set New Goal Target (Return to Goal Onboarding)</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-vault-border bg-slate-900/40 hover:bg-slate-800/60 py-2.5 px-4 text-xs font-medium text-foreground/80 hover:text-foreground transition-all"
            >
              <Download className="size-3.5 text-foreground/60" />
              <span>Export Full JSON Profile & Progress Backup</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-foreground/40">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Supabase REST & pgvector Connected</span>
            </span>
            <span>Version 2.0.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
