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
  Play
} from "lucide-react";
import { Goal, Milestone } from "@/lib/types";
import { InteractiveHoverCard } from "@/components/ui/interactive-hover-card";
import confetti from "canvas-confetti";

interface GoalRoadmapViewProps {
  goal: Goal;
  onToggleActionItem: (milestoneId: string, actionId: string) => void;
  onOpenVideoStudy: (milestone: Milestone) => void;
  onOpenAssessment: () => void;
}

export const GoalRoadmapView: React.FC<GoalRoadmapViewProps> = ({
  goal,
  onToggleActionItem,
  onOpenVideoStudy,
  onOpenAssessment,
}) => {
  const isGoalFinished = goal.progressPercentage >= 100;

  return (
    <div className="space-y-8">
      {/* Goal Header Banner */}
      <div className="relative rounded-3xl border border-vault-border bg-gradient-to-r from-indigo-950/40 via-vault-card to-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-400">
                {goal.domain}
              </span>
              <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-foreground/70 flex items-center gap-1">
                <Clock className="size-3 text-cyan-400" />
                {goal.targetDuration}
              </span>
              <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-foreground/70">
                {goal.difficultyLevel} Level
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {goal.title}
            </h1>

            <p className="text-xs sm:text-sm text-foreground/60 max-w-2xl leading-relaxed">
              Synthesized by Gemini 3.8 Flash. Complete structured milestone tasks and watch verified video masterclasses to advance your mastery progress.
            </p>
          </div>

          {/* Right Action: Quiz Trigger or Best Video */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            {isGoalFinished ? (
              <button
                onClick={onOpenAssessment}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 px-6 font-bold text-white shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Trophy className="size-4" />
                <span>Take Post-Goal Quiz / Exam</span>
              </button>
            ) : (
              <button
                onClick={onOpenAssessment}
                className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 py-3 px-5 text-xs font-bold text-indigo-300 transition-all hover:scale-105"
              >
                <Sparkles className="size-4 text-amber-400" />
                <span>Quiz & Domain Exam (Test Anytime)</span>
              </button>
            )}

            {/* Best Curated Video Link */}
            <a
              href={goal.bestVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-vault-border bg-slate-900/60 hover:bg-slate-800 py-2.5 px-4 text-xs font-medium text-foreground/80 hover:text-foreground transition-all"
            >
              <Video className="size-3.5 text-red-400" />
              <span>Full Video Masterclass</span>
              <ExternalLink className="size-3 text-foreground/40" />
            </a>
          </div>
        </div>

        {/* Progress Bar & Milestone Counters */}
        <div className="mt-6 pt-6 border-t border-vault-border">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-foreground/80">Curriculum Completion</span>
            <span className="font-black text-indigo-400 text-sm">{goal.progressPercentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden p-0.5 border border-vault-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-700 shadow-sm"
              style={{ width: `${goal.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Sequential Milestone Roadmap
            </h2>
          </div>
          <span className="text-xs text-foreground/50">
            {goal.milestones.filter((m) => m.isCompleted).length} / {goal.milestones.length} Stages Completed
          </span>
        </div>

        <div className="space-y-4">
          {goal.milestones.map((milestone, idx) => (
            <InteractiveHoverCard
              key={milestone.id}
              glowColor="rgba(99, 102, 241, 0.25)"
              className={`p-6 rounded-3xl border transition-all ${
                milestone.isCompleted
                  ? "border-emerald-500/30 bg-emerald-950/10"
                  : "border-vault-border bg-vault-card/85"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Milestone Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 text-xs">
                      Day {milestone.dayNumber}
                    </span>
                    <span className="text-xs text-foreground/50 flex items-center gap-1">
                      <Clock className="size-3 text-cyan-400" />
                      {milestone.timeEstimate}
                    </span>
                    {milestone.isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        Milestone Completed (+100 XP)
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {milestone.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Mental Models */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {milestone.mentalModels?.map((mm, mmIdx) => (
                      <span
                        key={mmIdx}
                        className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-foreground/60"
                      >
                        ⚡ {mm}
                      </span>
                    ))}
                  </div>

                  {/* Action Item Checklists */}
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                      Concrete Action Tasks
                    </div>
                    {milestone.actionItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleActionItem(milestone.id, item.id)}
                        className="group flex items-start gap-2.5 cursor-pointer text-xs select-none"
                      >
                        <button type="button" className="mt-0.5 text-foreground/60 group-hover:text-indigo-400">
                          {item.completed ? (
                            <CheckSquare className="size-4 text-emerald-400" />
                          ) : (
                            <Square className="size-4 text-foreground/40" />
                          )}
                        </button>
                        <span
                          className={`transition-colors ${
                            item.completed ? "line-through text-foreground/40" : "text-foreground/80 group-hover:text-foreground"
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Curated Video Box */}
                <div className="w-full lg:w-72 flex-shrink-0 rounded-2xl border border-vault-border bg-slate-900/60 p-3.5 space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer" onClick={() => onOpenVideoStudy(milestone)}>
                    <img
                      src={`https://img.youtube.com/vi/${milestone.youtubeVideoId}/hqdefault.jpg`}
                      alt={milestone.title}
                      className="size-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-center justify-center size-10 rounded-full bg-red-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="size-5 fill-white translate-x-0.5" />
                      </div>
                    </div>
                    {milestone.isVideoWatched && (
                      <div className="absolute top-2 right-2 rounded-full bg-emerald-500 text-white p-1 shadow-md">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-foreground line-clamp-1">
                      {milestone.youtubeVideoTitle || milestone.title}
                    </div>
                    <div className="text-[11px] text-foreground/50 mt-0.5">
                      Curated Public YouTube Masterclass
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenVideoStudy(milestone)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 py-2 px-3 text-xs font-semibold text-indigo-300 transition-all hover:scale-[1.01]"
                  >
                    <Video className="size-3.5" />
                    <span>Watch & AI Note Bar</span>
                  </button>
                </div>
              </div>
            </InteractiveHoverCard>
          ))}
        </div>
      </div>
    </div>
  );
};
