"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Flame,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";
import { DailyQuest, UserProfile } from "@/lib/types";
import confetti from "canvas-confetti";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: DailyQuest[];
  onToggleQuest: (questId: string) => void;
  user: UserProfile;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  quests,
  onToggleQuest,
  user,
}) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  if (!isOpen) return null;

  const today = new Date();
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
  const monthName = currentMonthDate.toLocaleString("default", { month: "long" });
  const year = currentMonthDate.getFullYear();
  const daysInMonth = new Date(year, currentMonthDate.getMonth() + 1, 0).getDate();
  const startDayOfWeek = currentMonthDate.getDay();

  // Streak days (sample mock for activity)
  const activeStreakDays = [1, 2, 4, 7, 8, 9, 10, 11, 14, 15, 17, 18, 19, 21, 22, 23, 24];

  const handleQuestClick = (quest: DailyQuest) => {
    onToggleQuest(quest.id);
    if (!quest.isCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const completedCount = quests.filter(q => q.isCompleted).length;
  const progressPercent = Math.round((completedCount / (quests.length || 1)) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-vault-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <CalendarIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Interactive Learning Calendar</span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    <Flame className="size-3 fill-amber-400 text-amber-400" />
                    {user.currentStreak}-Day Streak
                  </span>
                </h2>
                <p className="text-xs text-foreground/60">
                  Track consistency, daily study quests, and earn XP multipliers.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-slate-800/60 transition-all"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left: Interactive Calendar Grid */}
            <div className="rounded-2xl border border-vault-border bg-slate-900/40 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-foreground">
                  {monthName} {year}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentMonthOffset((p) => p - 1)}
                    className="p-1 rounded-lg text-foreground/60 hover:text-foreground hover:bg-slate-800"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentMonthOffset(0);
                      setSelectedDay(today.getDate());
                    }}
                    className="text-[10px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentMonthOffset((p) => p + 1)}
                    className="p-1 rounded-lg text-foreground/60 hover:text-foreground hover:bg-slate-800"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-foreground/40 mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>

              {/* Day Numbers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = currentMonthOffset === 0 && dayNum === today.getDate();
                  const isSelected = dayNum === selectedDay;
                  const hasStreak = activeStreakDays.includes(dayNum);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`relative h-8 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                          : isToday
                          ? "border border-indigo-400 text-indigo-300 font-bold"
                          : "text-foreground/75 hover:bg-slate-800/60"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {hasStreak && (
                        <span
                          className={`size-1 rounded-full ${
                            isSelected ? "bg-amber-300" : "bg-amber-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-vault-border flex items-center justify-between text-[11px] text-foreground/50">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span>Streak Active</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full border border-indigo-400" />
                  <span>Current Day</span>
                </span>
              </div>
            </div>

            {/* Right: Daily Quests List */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-amber-400" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Daily Learning Quests
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-foreground/60">
                    {completedCount} / {quests.length} Done
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Quests Checkbox List */}
                <div className="space-y-2.5">
                  {quests.map((quest) => (
                    <div
                      key={quest.id}
                      onClick={() => handleQuestClick(quest)}
                      className={`group flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                        quest.isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                          : "border-vault-border bg-slate-900/40 hover:bg-slate-800/60"
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-foreground/60">
                        {quest.isCompleted ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : (
                          <Circle className="size-4 text-foreground/40 group-hover:text-indigo-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-semibold ${
                            quest.isCompleted ? "line-through text-foreground/60" : "text-foreground"
                          }`}
                        >
                          {quest.questName}
                        </div>
                        <div className="text-[11px] text-foreground/50 truncate">
                          {quest.description}
                        </div>
                      </div>
                      <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20 whitespace-nowrap">
                        +{quest.xpReward} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Bonus Box */}
              <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-indigo-400" />
                  <span className="text-xs text-foreground/80 font-medium">
                    2x Streak Multiplier Unlocked!
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-400">+{completedCount * 50} XP Today</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
