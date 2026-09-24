"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { Award, Flame, Clock, Brain, CheckCircle2, TrendingUp, Sparkles, Shield } from "lucide-react";
import { UserProfile } from "@/lib/types";

interface AnalyticsDashboardProps {
  user: UserProfile;
}

const STUDY_HOURS_DATA = [
  { day: "Mon", planned: 2.0, actual: 2.5 },
  { day: "Tue", planned: 2.0, actual: 3.0 },
  { day: "Wed", planned: 2.0, actual: 1.5 },
  { day: "Thu", planned: 2.5, actual: 3.5 },
  { day: "Fri", planned: 2.0, actual: 2.0 },
  { day: "Sat", planned: 3.0, actual: 4.5 },
  { day: "Sun", planned: 2.0, actual: 3.0 },
];

const VAULT_COMPOSITION_DATA = [
  { name: "Summaries", value: 35, color: "#06b6d4" },
  { name: "AI Notes", value: 25, color: "#6366f1" },
  { name: "Code Snippets", value: 20, color: "#8b5cf6" },
  { name: "Roadmaps", value: 12, color: "#10b981" },
  { name: "Certificates", value: 8, color: "#f59e0b" },
];

const SKILL_RADAR_DATA = [
  { subject: "Systems Invariants", A: 92, fullMark: 100 },
  { subject: "Async Concurrency", A: 88, fullMark: 100 },
  { subject: "Distributed Caching", A: 85, fullMark: 100 },
  { subject: "AI & Gemini 3.8", A: 95, fullMark: 100 },
  { subject: "Kernel & eBPF", A: 78, fullMark: 100 },
  { subject: "API Resilience", A: 90, fullMark: 100 },
];

const BADGES = [
  { name: "First Milestone", desc: "Completed 1st Roadmap Checkpoint", icon: "🚀", unlocked: true },
  { name: "7-Day Streak", desc: "Maintained active study streak", icon: "🔥", unlocked: true },
  { name: "Vector Archon", desc: "Indexed 10+ items in pgvector", icon: "🧠", unlocked: true },
  { name: "Exam Ace", desc: "Scored 80%+ on Domain Assessment", icon: "🏆", unlocked: true },
  { name: "Staff Contender", desc: "Mastered concurrency invariants", icon: "⚡", unlocked: false },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Analytics & Mastery Dashboard</h1>
          <p className="text-xs text-foreground/60">
            Real-time telemetry on hours studied, memory composition, and skill proficiencies.
          </p>
        </div>

        {/* Current XP Progress */}
        <div className="flex items-center gap-3 rounded-2xl border border-vault-border bg-vault-card p-3 shadow-sm">
          <div className="flex items-center justify-center size-10 rounded-xl bg-indigo-500/15 text-indigo-400">
            <Award className="size-5" />
          </div>
          <div>
            <div className="text-[11px] text-foreground/50 uppercase font-bold">Total Mastery XP</div>
            <div className="text-base font-black text-foreground">{user.totalXp} XP (Level 12)</div>
          </div>
        </div>
      </div>

      {/* Recharts Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Study Hours Tracking */}
        <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Weekly Study Tracking</h2>
              <p className="text-[11px] text-foreground/50">Planned vs. Actual Learning Hours</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              +20.0 hrs total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STUDY_HOURS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="planned" fill="#475569" radius={[4, 4, 0, 0]} name="Planned (hrs)" />
                <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual (hrs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Skill Mastery Radar */}
        <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-foreground">Skill Mastery Radar</h2>
              <p className="text-[11px] text-foreground/50">Multi-axis proficiency assessment</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
              88% Average
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILL_RADAR_DATA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Proficiency" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Knowledge Composition Donut */}
        <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Memory Vault Composition</h2>
              <p className="text-[11px] text-foreground/50">Distribution of ingested vector embeddings</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              pgvector Active
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VAULT_COMPOSITION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {VAULT_COMPOSITION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
            {VAULT_COMPOSITION_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-foreground/70">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Activity Heatmap Matrix */}
        <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-foreground">30-Day Activity Heatmap</h2>
                <p className="text-[11px] text-foreground/50">Daily consistency & spaced repetition</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Flame className="size-3.5 fill-amber-400" />
                <span>{user.currentStreak}-Day Streak</span>
              </div>
            </div>

            {/* Matrix */}
            <div className="grid grid-cols-10 gap-1.5 pt-4">
              {Array.from({ length: 30 }).map((_, i) => {
                const intensity = [3, 2, 4, 1, 0, 4, 3, 2, 4, 3, 1, 4, 3, 2, 4, 0, 2, 4, 3, 4, 1, 3, 4, 4, 2, 3, 4, 4, 3, 4][i];
                const colors = [
                  "bg-slate-800/40",
                  "bg-indigo-900/60",
                  "bg-indigo-700/70",
                  "bg-indigo-500",
                  "bg-cyan-400"
                ];
                return (
                  <div
                    key={i}
                    title={`Day ${i + 1}: ${intensity * 1.5} hrs studied`}
                    className={`h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer ${colors[intensity]}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-4 border-t border-vault-border mt-4">
            <span>Less Active</span>
            <div className="flex items-center gap-1">
              <span className="size-2 rounded bg-slate-800/60" />
              <span className="size-2 rounded bg-indigo-900/60" />
              <span className="size-2 rounded bg-indigo-700" />
              <span className="size-2 rounded bg-indigo-500" />
              <span className="size-2 rounded bg-cyan-400" />
            </div>
            <span>Highly Active</span>
          </div>
        </div>
      </div>

      {/* Unlockable Mastery Badges */}
      <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl shadow-lg">
        <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Award className="size-4 text-amber-400" />
          <span>Unlockable Engineering Badges</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BADGES.map((b, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center transition-all ${
                b.unlocked
                  ? "border-amber-500/30 bg-amber-500/10 shadow-sm"
                  : "border-vault-border bg-slate-900/40 opacity-50"
              }`}
            >
              <div className="text-3xl mb-2">{b.icon}</div>
              <div className="text-xs font-bold text-foreground">{b.name}</div>
              <div className="text-[10px] text-foreground/50 mt-0.5 leading-snug">{b.desc}</div>
              <div className="mt-2 text-[9px] font-bold uppercase tracking-wider">
                {b.unlocked ? (
                  <span className="text-emerald-400">Unlocked ✓</span>
                ) : (
                  <span className="text-foreground/40">In Progress</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
