"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Clock,
  FolderArchive,
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const TUTORIAL_STEPS = [
  {
    id: "roadmap",
    badge: "Step 1 • Set Your Goal & Daily Time",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    title: "How to Generate Your Custom AI Roadmap",
    description:
      "Type any skill you want to master (e.g. 'Full-Stack Next.js with Gemini' or 'Rust Systems'). Select your completion duration and daily commitment (30m, 1h, 2h, or 4h/day). Click 'Generate AI Roadmap' or tap any starter chip to get instant structured milestones with curated YouTube masterclasses.",
    icon: Target,
    gradient: "from-indigo-600 via-violet-600 to-indigo-800",
    tip: "Your daily commitment calibrates the milestone pace and estimated study hours automatically.",
    highlightTag: "AI Roadmap"
  },
  {
    id: "milestones",
    badge: "Step 2 • Track Milestones & Study Labs",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    title: "How to Complete Tasks & Watch Masterclasses",
    description:
      "Click checkboxes as you finish tasks to earn +25 XP and watch the progress bar advance. Click 'Watch Lecture Video' on any milestone card to open the in-app video player with automatic AI note generation and auto-completion (+100 XP).",
    icon: Clock,
    gradient: "from-cyan-600 via-teal-600 to-emerald-700",
    tip: "Completing 100% of the roadmap unlocks your Post-Goal Quiz Assessment and Certificate!",
    highlightTag: "Interactive Lab"
  },
  {
    id: "vault",
    badge: "Step 3 • AI Digital Vault & Semantic Search",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    title: "How to Search Conceptually Across Your Vault",
    description:
      "Click 'Storage' in the top header or 'Memory Vault' in the sidebar. Type queries in natural English like 'How does async locking work?' to search concepts using Gemini & pgvector. Click 'Ask AI about this document' on any note for instant Q&A clarification.",
    icon: FolderArchive,
    gradient: "from-blue-600 via-indigo-600 to-cyan-700",
    tip: "You can also upload your own markdown notes and PDF research summaries directly into the vault.",
    highlightTag: "Semantic Search"
  },
  {
    id: "mentor",
    badge: "Step 4 • Adaptive AI Mentor Hub",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    title: "How to Consult Mentors & Listen to Audio",
    description:
      "Navigate to 'AI Mentors' in the sidebar to chat with 4 specialized coaching personas: Socratic First-Principles, Staff Architect, Friendly Tutor, or Exam Drillmaster. Tap the speaker icon beside any message to hear the answer spoken aloud.",
    icon: Bot,
    gradient: "from-purple-600 via-pink-600 to-indigo-800",
    tip: "Switch personas mid-conversation to get different architectural perspectives on the same concept.",
    highlightTag: "Multi-Persona"
  },
  {
    id: "controls",
    badge: "Step 5 • Themes, Quests & Profile Tour",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    title: "How to Toggle Themes & Replay This Tour",
    description:
      "Switch between Day Mode and Dark Mode anytime using the Sun/Moon toggle in the header. Check off daily learning quests by clicking 'Calendar'. You can replay this interactive tutorial at any time by clicking 'Tour' in the top bar or inside your Profile.",
    icon: Sparkles,
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    tip: "Click your avatar in the top right to export a full JSON backup of your progress anytime.",
    highlightTag: "Day/Dark Mode"
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  userName = "Pardhu"
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/30 flex flex-col overflow-hidden"
        >
          {/* Top Ambient Glow */}
          <div className="pointer-events-none absolute -top-32 -right-32 size-72 rounded-full bg-indigo-500/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-72 rounded-full bg-cyan-500/15 blur-[100px]" />

          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-4 border-b border-vault-border relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md">
                <div className="flex items-center justify-center size-full rounded-lg bg-slate-950/80">
                  <Sparkles className="size-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Quick Feature Walkthrough
                </h3>
                <p className="text-[11px] text-foreground/50">
                  Welcome to Progress, {userName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="text-xs text-foreground/50 hover:text-foreground font-medium px-2 py-1 rounded-lg hover:bg-slate-800/40 transition-all"
              >
                Skip Tour
              </button>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-foreground/50 hover:text-foreground hover:bg-slate-800 transition-all"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center justify-between gap-1.5 py-4 relative z-10">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-sm shadow-indigo-500/50"
                    : idx < currentStep
                    ? "bg-indigo-500/50"
                    : "bg-slate-800/60 dark:bg-slate-800/60"
                }`}
                title={`Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          {/* Slide Content with Animation */}
          <div className="relative py-4 min-h-[260px] flex flex-col justify-between z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {/* Badge and Tag */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${step.badgeColor}`}>
                    <Sparkles className="size-3" />
                    <span>{step.badge}</span>
                  </span>
                  <span className="text-xs font-semibold text-foreground/40">
                    {currentStep + 1} of {TUTORIAL_STEPS.length}
                  </span>
                </div>

                {/* Hero Icon + Title */}
                <div className="flex items-start gap-4 pt-1">
                  <div className={`flex-shrink-0 flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br ${step.gradient} p-0.5 shadow-xl`}>
                    <div className="flex items-center justify-center size-full rounded-2xl bg-slate-950/70">
                      <StepIcon className="size-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-foreground/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Helpful Pro Tip Box */}
                <div className="rounded-2xl border border-vault-border bg-slate-900/40 dark:bg-slate-900/40 p-3.5 flex items-center gap-3">
                  <div className="flex items-center justify-center size-7 rounded-xl bg-cyan-500/15 text-cyan-400 flex-shrink-0">
                    <Zap className="size-3.5" />
                  </div>
                  <div className="text-xs text-foreground/80 leading-normal">
                    <span className="font-semibold text-cyan-400">Pro Tip: </span>
                    {step.tip}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-vault-border relative z-10">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none rounded-xl hover:bg-slate-800/40 transition-all"
            >
              <ArrowLeft className="size-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{isLast ? "Ready — Launch Progress!" : "Next Step"}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
