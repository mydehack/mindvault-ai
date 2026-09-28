"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Video,
  ExternalLink,
  Sparkles,
  Trophy,
  ArrowRight,
  Flame,
  CheckSquare,
  Square,
  Play,
  Bot,
  RefreshCw,
  Zap,
  ShieldCheck,
  Compass
} from "lucide-react";
import { Goal, Milestone } from "@/lib/types";
import { InteractiveHoverCard } from "@/components/ui/interactive-hover-card";
import confetti from "canvas-confetti";

interface GoalRoadmapViewProps {
  goal: Goal;
  onToggleActionItem: (milestoneId: string, actionId: string) => void;
  onOpenVideoStudy: (milestone: Milestone) => void;
  onOpenAssessment: () => void;
  onOpenVideoLab?: () => void;
  onOpenCopilot?: (prefillPrompt?: string) => void;
}

export const GoalRoadmapView: React.FC<GoalRoadmapViewProps> = ({
  goal,
  onToggleActionItem,
  onOpenVideoStudy,
  onOpenAssessment,
  onOpenVideoLab,
  onOpenCopilot,
}) => {
  const isGoalFinished = goal.progressPercentage >= 100;

  const stageTags = [
    { label: "Stage 1: Foundation Masterclass", color: "from-amber-500/20 to-amber-600/10 text-amber-300 border-amber-500/30" },
    { label: "Stage 2: Core Mechanics Course", color: "from-cyan-500/20 to-blue-600/10 text-cyan-300 border-cyan-500/30" },
    { label: "Stage 3: Deep Dive Systems", color: "from-indigo-500/20 to-purple-600/10 text-indigo-300 border-indigo-500/30" },
    { label: "Stage 4: Hands-on Project Build", color: "from-emerald-500/20 to-teal-600/10 text-emerald-300 border-emerald-500/30" },
    { label: "Stage 5: Production & Capstone", color: "from-rose-500/20 to-amber-600/10 text-rose-300 border-rose-500/30" },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Luxury Obsidian & Gold Hero Banner */}
      <div className="relative rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0F121C] via-[#0A0C14] to-[#080910] p-6 sm:p-9 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Ambient luminous glow highlights */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300 shadow-sm flex items-center gap-1.5">
                <Compass className="size-3 text-amber-400" />
                {goal.domain}
              </span>
              <span className="rounded-full bg-slate-900/90 border border-white/10 px-3 py-1 text-xs text-foreground/80 flex items-center gap-1.5">
                <Clock className="size-3 text-cyan-400" />
                <span>{goal.targetDuration}</span>
              </span>
              {goal.dailyCommitment && (
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="size-3 text-cyan-400" />
                  <span>{goal.dailyCommitment}</span>
                </span>
              )}
              <span className="rounded-full bg-slate-900/90 border border-white/10 px-3 py-1 text-xs font-semibold text-foreground/75">
                {goal.difficultyLevel} Level
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" />
                Distinct AI Curated Videos
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200 tracking-tight">
                {goal.title}
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-2xl leading-relaxed mt-2">
                Engineered with Gemini 3.8 Flash. Every milestone features an independent, stage-matched masterclass. You have access to our real-time AI Roadmap Copilot to adapt video pacing, instructors, or depth.
              </p>
            </div>
          </div>

          {/* Right Action Suite: Copilot + Quiz Trigger + Video Scout */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            {/* Primary: Open Roadmap AI Copilot */}
            {onOpenCopilot && (
              <button
                onClick={() => onOpenCopilot()}
                className="group relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-3.5 px-6 font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Bot className="size-4 text-slate-950" />
                <span>Roadmap AI Copilot</span>
                <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[10px] text-slate-950 font-black">
                  AI
                </span>
              </button>
            )}

            {isGoalFinished ? (
              <button
                onClick={onOpenAssessment}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 px-6 font-bold text-white shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all text-xs"
              >
                <Trophy className="size-4" />
                <span>Take Post-Goal Certification Exam</span>
              </button>
            ) : (
              <button
                onClick={onOpenAssessment}
                className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 py-2.5 px-5 text-xs font-bold text-indigo-300 transition-all hover:scale-105"
              >
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Quiz & Knowledge Assessment</span>
              </button>
            )}

            {/* Video Scout & Masterclass Links */}
            <div className="flex items-center gap-2">
              {onOpenVideoLab && (
                <button
                  onClick={onOpenVideoLab}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 py-2 px-3 text-[11px] font-bold text-red-300 transition-all hover:scale-105 shadow-sm"
                >
                  <Sparkles className="size-3 text-red-400" />
                  <span>AI Video Scout</span>
                </button>
              )}

              <a
                href={goal.bestVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 py-2 px-3 text-[11px] font-medium text-foreground/80 hover:text-foreground transition-all"
              >
                <Video className="size-3 text-red-400" />
                <span>Best Full Course</span>
                <ExternalLink className="size-2.5 text-foreground/40" />
              </a>
            </div>
          </div>
        </div>

        {/* Progress Bar & Milestone Counters */}
        <div className="mt-7 pt-6 border-t border-amber-500/20">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground/90 uppercase tracking-wider text-[11px]">
                Curriculum Mastery Progress
              </span>
              <span className="rounded-full bg-slate-900 border border-white/10 px-2 py-0.5 text-[10px] text-foreground/60">
                {goal.milestones.filter((m) => m.isCompleted).length} of {goal.milestones.length} Stages Completed
              </span>
            </div>
            <span className="font-black text-amber-300 text-sm">{goal.progressPercentage}%</span>
          </div>

          <div className="h-3 w-full rounded-full bg-[#080910] overflow-hidden p-0.5 border border-amber-500/30 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-md shadow-amber-500/20"
              style={{ width: `${goal.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sequential Milestone Roadmap Timeline */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
              <Target className="size-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                Sequential Pedagogical Milestones
              </h2>
              <p className="text-[11px] text-foreground/50">
                Each milestone contains a verified distinct YouTube tutorial matched to its curriculum depth.
              </p>
            </div>
          </div>

          {onOpenCopilot && (
            <button
              onClick={() => onOpenCopilot()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-all hover:scale-105 self-start sm:self-auto cursor-pointer"
            >
              <Bot className="size-3.5 text-amber-400" />
              <span>Ask AI Copilot to Modify Videos</span>
            </button>
          )}
        </div>

        {/* Milestone Cards */}
        <div className="space-y-5">
          {goal.milestones.map((milestone, idx) => {
            const stageBadge = stageTags[idx] || stageTags[0];

            return (
              <InteractiveHoverCard
                key={milestone.id}
                glowColor="rgba(212, 175, 55, 0.18)"
                className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                  milestone.isCompleted
                    ? "border-emerald-500/30 bg-gradient-to-br from-[#0A1210] to-[#060A08]"
                    : "border-amber-500/20 bg-gradient-to-br from-[#0E1019]/90 via-[#0A0C14]/90 to-[#07080F]/90 backdrop-blur-xl"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Milestone Info & Action Items */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300 font-black px-2.5 py-0.5 text-xs">
                        Stage {idx + 1} • Day {milestone.dayNumber}
                      </span>

                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${stageBadge.color}`}>
                        {stageBadge.label}
                      </span>

                      <span className="text-xs text-foreground/50 flex items-center gap-1">
                        <Clock className="size-3 text-cyan-400" />
                        {milestone.timeEstimate}
                      </span>

                      {milestone.isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="size-3.5" />
                          Stage Completed (+100 XP)
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-xl font-black text-foreground tracking-tight">
                        {milestone.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed mt-1.5">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Mental Models */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {milestone.mentalModels?.map((mm, mmIdx) => (
                        <span
                          key={mmIdx}
                          className="rounded-lg bg-slate-900/90 border border-white/5 px-2.5 py-1 text-[10px] font-semibold text-foreground/70"
                        >
                          ⚡ {mm}
                        </span>
                      ))}
                    </div>

                    {/* Action Item Checklists */}
                    <div className="pt-2 space-y-2.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-300/70">
                        Action Checklist
                      </div>
                      <div className="space-y-2">
                        {milestone.actionItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onToggleActionItem(milestone.id, item.id)}
                            className="group flex items-start gap-2.5 cursor-pointer text-xs select-none p-2 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <button type="button" className="mt-0.5 text-foreground/60 group-hover:text-amber-400">
                              {item.completed ? (
                                <CheckSquare className="size-4 text-emerald-400" />
                              ) : (
                                <Square className="size-4 text-foreground/40" />
                              )}
                            </button>
                            <span
                              className={`transition-colors leading-relaxed ${
                                item.completed
                                  ? "line-through text-foreground/40"
                                  : "text-foreground/80 group-hover:text-foreground font-medium"
                              }`}
                            >
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Curated Video Box with AI Copilot Swap Trigger */}
                  <div className="w-full lg:w-80 flex-shrink-0 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#10131E] to-[#0A0C14] p-4 space-y-3.5 shadow-xl">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Video className="size-3 text-amber-400" />
                        Stage Video Course
                      </span>
                      {onOpenCopilot && (
                        <button
                          onClick={() =>
                            onOpenCopilot(
                              `I need a better video for Stage ${idx + 1} (${milestone.title}). The current video "${milestone.youtubeVideoTitle}" has issues with pacing or prerequisite clarity. Can you replace it?`
                            )
                          }
                          className="text-[10px] text-amber-400/80 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="size-2.5" />
                          <span>Request Swap</span>
                        </button>
                      )}
                    </div>

                    <div
                      className="relative aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer border border-white/10"
                      onClick={() => onOpenVideoStudy(milestone)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${milestone.youtubeVideoId}/hqdefault.jpg`}
                        alt={milestone.title}
                        className="size-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-center justify-center size-11 rounded-full bg-red-600 text-white shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="size-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      {milestone.isVideoWatched && (
                        <div className="absolute top-2 right-2 rounded-full bg-emerald-500 text-slate-950 p-1 shadow-md font-bold">
                          <CheckCircle2 className="size-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                        {milestone.youtubeVideoTitle || milestone.title}
                      </div>
                      <div className="text-[10px] text-foreground/50 mt-1 flex items-center justify-between">
                        <span>Distinct Verified Tutorial</span>
                        <span className="text-amber-400 font-mono">ID: {milestone.youtubeVideoId.slice(0, 8)}...</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() => onOpenVideoStudy(milestone)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/40 py-2.5 px-3 text-xs font-bold text-indigo-200 transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <Video className="size-3.5" />
                        <span>Watch & Generate Notes</span>
                      </button>

                      {onOpenCopilot && (
                        <button
                          onClick={() =>
                            onOpenCopilot(
                              `Review the video for Stage ${idx + 1} (${milestone.title}). Is this the best video for someone learning ${goal.title}? If it's too fast or lacks code examples, please swap it.`
                            )
                          }
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 py-2 px-3 text-[11px] font-bold text-amber-300 transition-all hover:scale-[1.01] cursor-pointer"
                        >
                          <Bot className="size-3 text-amber-400" />
                          <span>Ask Copilot to Change Video</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </InteractiveHoverCard>
            );
          })}
        </div>
      </div>

      {/* Floating Copilot Launcher Button */}
      {onOpenCopilot && (
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenCopilot()}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/40 border border-amber-300/40 cursor-pointer"
          >
            <div className="size-2 rounded-full bg-slate-950 animate-ping" />
            <Bot className="size-4 text-slate-950" />
            <span>AI Roadmap Copilot</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};
