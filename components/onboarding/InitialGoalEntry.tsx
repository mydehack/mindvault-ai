"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Target, Sparkles, Clock, Zap, ArrowRight, Compass, Flame, ShieldAlert } from "lucide-react";
import { UserProfile, ThemeMode } from "@/lib/types";
import { DayNightToggle } from "@/components/ui/day-night-toggle";
import { TextRoll } from "@/components/ui/skiper-ui/skiper58";
import confetti from "canvas-confetti";

interface InitialGoalEntryProps {
  user: UserProfile;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onSubmitGoal: (goalTitle: string, duration: string, level: string) => Promise<void>;
  onInstantCuratedLoad: () => void;
}

const STARTER_CHIPS = [
  { label: "🦀 Master Rust & Async Systems", title: "Master Rust and Async Programming in 30 days", duration: "30 days" },
  { label: "⚡ Full-Stack AI with Gemini 3.8", title: "Full-Stack AI Engineering with Gemini 3.8 & Agents", duration: "21 days" },
  { label: "🌐 Distributed Systems & Consensus", title: "Distributed Systems, Raft Consensus & Microservices", duration: "30 days" },
  { label: "☸️ Cloud Native Kubernetes at Scale", title: "Cloud Native Kubernetes, Docker & eBPF", duration: "14 days" },
];

const DURATIONS = ["14 days", "21 days", "30 days", "6 weeks", "3 months"];

export const InitialGoalEntry: React.FC<InitialGoalEntryProps> = ({
  user,
  currentTheme,
  onThemeChange,
  onSubmitGoal,
  onInstantCuratedLoad,
}) => {
  const [goalTitle, setGoalTitle] = useState("");
  const [targetDuration, setTargetDuration] = useState("30 days");
  const [difficultyLevel, setDifficultyLevel] = useState("Intermediate");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setIsGenerating(true);
    try {
      // Fire confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      await onSubmitGoal(goalTitle.trim(), targetDuration, difficultyLevel);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChipClick = (title: string, duration: string) => {
    setGoalTitle(title);
    setTargetDuration(duration);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-48 -left-48 size-[600px] rounded-full bg-indigo-600/15 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 size-[600px] rounded-full bg-cyan-600/15 blur-[160px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 size-[450px] rounded-full bg-violet-600/10 blur-[140px]" />

      {/* Top Header with User Badge & Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <img src={user.avatarUrl} alt={user.fullName} className="size-9 rounded-xl border border-vault-border bg-slate-900/60 p-1" />
          <div>
            <div className="text-xs font-semibold text-foreground/80">Welcome, {user.fullName}</div>
            <div className="text-[11px] text-foreground/50">{user.role}</div>
          </div>
        </div>
        <DayNightToggle theme={currentTheme} onThemeChange={onThemeChange} />
      </div>

      {/* Centered Goal Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-vault-border bg-vault-card/85 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl shadow-indigo-950/25"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Target className="size-3.5" />
            <span>AI Goal-to-Action Generator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            What do you want to <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">master</span>?
          </h1>
          <p className="mt-2 text-sm text-foreground/60 max-w-md mx-auto">
            Input any engineering topic or target. Gemini 3.8 Flash will structure milestone checkpoints, action checklists, and curate public YouTube masterclasses.
          </p>
        </div>

        {/* 1-Click Starter Chips */}
        <div className="mb-6">
          <div className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-400" />
            <span>High-Yield Starter Presets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {STARTER_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip.title, chip.duration)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left ${
                  goalTitle === chip.title
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-semibold shadow-sm"
                    : "border-vault-border bg-slate-900/40 text-foreground/75 hover:bg-slate-800/60 hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Goal Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">
              Learning Target / Skill Goal
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Master Rust and Async Programming in 30 days"
                className="w-full rounded-2xl border border-vault-border bg-slate-900/60 dark:bg-slate-900/60 pl-4 pr-12 py-4 text-base text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all shadow-inner"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Target className="size-5 text-indigo-400/60" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Duration Selector */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">
                <Clock className="size-3.5 text-indigo-400" />
                <span>Target Timeline</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setTargetDuration(dur)}
                    className={`py-2 text-[11px] font-medium rounded-xl border transition-all ${
                      targetDuration === dur
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold"
                        : "border-vault-border bg-slate-900/40 text-foreground/60 hover:text-foreground hover:bg-slate-800/50"
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">
                <Zap className="size-3.5 text-amber-400" />
                <span>Current Proficiency</span>
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full rounded-xl border border-vault-border bg-slate-900/60 px-3.5 py-2.5 text-xs text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="Beginner">Beginner (Foundations & Syntax)</option>
                <option value="Intermediate">Intermediate (Core Idioms & Concurrency)</option>
                <option value="Advanced">Advanced (Kernel, Internals & Scale)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isGenerating || !goalTitle.trim()}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 py-4 px-6 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synthesizing Curriculum with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <span>Generate Actionable Roadmap & Unlock MindVault</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>

            {/* Instant Curated Load button */}
            <button
              type="button"
              onClick={onInstantCuratedLoad}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-vault-border bg-slate-900/40 hover:bg-slate-800/60 py-2.5 px-4 text-xs font-medium text-foreground/70 hover:text-foreground transition-all"
            >
              <Zap className="size-3.5 text-cyan-400" />
              <span>Instant Load: Pre-Built Master Rust & Async Roadmap</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
