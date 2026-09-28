"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, ArrowRight, ShieldCheck, User, Mail, Briefcase, Compass, Clock } from "lucide-react";
import { UserProfile, ThemeMode } from "@/lib/types";
import { DayNightToggle } from "@/components/ui/day-night-toggle";
import { TextRoll } from "@/components/ui/skiper-ui/skiper58";

interface LoginViewProps {
  onLogin: (profile: UserProfile) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const getAutoAvatar = (seed: string) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || 'Progress')}`;

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  currentTheme,
  onThemeChange
}) => {
  const [fullName, setFullName] = useState("Pardhu");
  const [email, setEmail] = useState("pardhu@progress.ai");
  const [role, setRole] = useState("Full-Stack AI & Systems Architect");
  const [learningStyle, setLearningStyle] = useState("Socratic Deep-Dive");
  const [dailyCommitment, setDailyCommitment] = useState("2 hours / day");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim() || "Pardhu";
    const profile: UserProfile = {
      id: "usr-" + Date.now(),
      fullName: name,
      email: email.trim() || "pardhu@progress.ai",
      role: role.trim() || "Full-Stack AI Architect",
      avatarUrl: getAutoAvatar(name),
      learningStyle,
      dailyCommitment,
      currentStreak: 7,
      totalXp: 1850,
      hoursStudied: 42.5,
      themePreference: currentTheme,
      createdAt: new Date().toISOString()
    };
    onLogin(profile);
  };

  const handleQuickDemo = () => {
    const demoProfile: UserProfile = {
      id: "usr-demo",
      fullName: "Pardhu",
      email: "pardhu@progress.ai",
      role: "Lead Systems Architect & AI Engineer",
      avatarUrl: getAutoAvatar("PardhuAI"),
      learningStyle: "Socratic Deep-Dive & Systems Invariants",
      currentStreak: 7,
      totalXp: 2100,
      hoursStudied: 48.0,
      themePreference: currentTheme,
      createdAt: new Date().toISOString()
    };
    onLogin(demoProfile);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Background Gradient Mesh & Floating Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-amber-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-amber-500/5 blur-[160px]" />

      {/* Top Header with Theme Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <DayNightToggle theme={currentTheme} onThemeChange={onThemeChange} />
      </div>

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#10131F] via-[#0A0C14] to-[#07090F] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/80"
      >
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-600 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 mb-4">
            <div className="flex items-center justify-center size-full rounded-2xl bg-[#0A0C14]">
              <Brain className="size-8 text-amber-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">
              Progress
            </span>
            <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
              AI OS
            </span>
          </div>
          <div className="mt-2 text-sm text-foreground/60 max-w-sm">
            <TextRoll center className="font-medium text-foreground/80">
              Autonomous Goal-to-Action & Memory Vault
            </TextRoll>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300/80 mb-1.5">
              <User className="size-3.5 text-amber-400" /> Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Pardhu"
              className="w-full rounded-xl border border-vault-border bg-slate-900/60 dark:bg-slate-900/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
              <Mail className="size-3.5 text-indigo-400" /> Work / School Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. pardhu@progress.ai"
              className="w-full rounded-xl border border-vault-border bg-slate-900/60 dark:bg-slate-900/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
              <Briefcase className="size-3.5 text-indigo-400" /> Primary Role & Target Domain
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Full-Stack AI Engineer, Systems Lead"
              className="w-full rounded-xl border border-vault-border bg-slate-900/60 dark:bg-slate-900/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
              <Compass className="size-3.5 text-indigo-400" /> Adaptive Learning Style
            </label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="w-full rounded-xl border border-vault-border bg-slate-900/60 dark:bg-slate-900/60 px-4 py-3 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="Socratic Deep-Dive">Socratic Deep-Dive (First Principles)</option>
              <option value="Hands-on Project Building">Hands-on Project Building</option>
              <option value="Staff Architect Tradeoffs">Staff Architect Tradeoffs & Latency</option>
              <option value="FAANG Exam Drill & Active Recall">FAANG Exam Drill & Active Recall</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
              <Clock className="size-3.5 text-cyan-400" /> How much time can you put daily to learn?
            </label>
            <select
              value={dailyCommitment}
              onChange={(e) => setDailyCommitment(e.target.value)}
              className="w-full rounded-xl border border-vault-border bg-slate-900/60 dark:bg-slate-900/60 px-4 py-3 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="30 mins / day">30 mins / day (Casual Micro-Learning)</option>
              <option value="1 hour / day">1 hour / day (Steady & Consistent)</option>
              <option value="2 hours / day">2 hours / day (Accelerated - Recommended)</option>
              <option value="3-4 hours / day">3-4 hours / day (Deep Immersion)</option>
              <option value="5+ hours / day">5+ hours / day (Full-Time Mastery)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-3.5 px-4 font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Initialize Progress Profile</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform text-slate-950" />
            </button>

            <button
              type="button"
              onClick={handleQuickDemo}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 py-3 px-4 text-xs font-semibold text-foreground/80 hover:text-foreground transition-all cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Instant 1-Click Demo Login (Pardhu)</span>
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground/50">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Local Privacy Encryption & pgvector Synced</span>
        </div>
      </motion.div>
    </div>
  );
};
