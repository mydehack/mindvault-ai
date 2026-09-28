"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Bot,
  User,
  Send,
  Video,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Target,
  ExternalLink,
  Flame,
  Clock,
  Layers
} from "lucide-react";
import { Goal, Milestone, RoadmapCopilotMessage, RoadmapVideoReplacement } from "@/lib/types";
import confetti from "canvas-confetti";

interface RoadmapCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onUpdateMilestoneVideo: (
    milestoneId: string,
    newVideoData: {
      youtubeVideoId: string;
      youtubeVideoTitle: string;
      youtubeVideoUrl: string;
    }
  ) => void;
  initialPrompt?: string;
  onOpenVideoStudy?: (milestone: Milestone) => void;
}

export const RoadmapCopilotModal: React.FC<RoadmapCopilotModalProps> = ({
  isOpen,
  onClose,
  goal,
  onUpdateMilestoneVideo,
  initialPrompt,
  onOpenVideoStudy,
}) => {
  const [messages, setMessages] = useState<RoadmapCopilotMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedReplacements, setAppliedReplacements] = useState<Record<string, RoadmapVideoReplacement>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation with full roadmap omniscience
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        const milestonesList = goal.milestones
          .map((m, idx) => `• Stage ${idx + 1}: **${m.title}** (Video: *${m.youtubeVideoTitle}*)`)
          .join("\n");

        setMessages([
          {
            id: "msg-init",
            role: "assistant",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            content: `Greetings! I am your **Progress AI Roadmap Copilot**. I have full real-time access to your **"${goal.title}"** curriculum.\n\nCurrently tracking ${goal.milestones.length} sequential stages:\n${milestonesList}\n\nIf any video tutorial feels too fast-paced, too theoretical, assumes prerequisites you haven't taken, or doesn't fit your daily schedule, let me know. If I evaluate that your hurdle is significant and common for learners, I will scout a superior masterclass and automatically update your roadmap in real-time!`
          }
        ]);
      }

      if (initialPrompt && initialPrompt.trim()) {
        sendMessage(initialPrompt.trim());
      }
    }
  }, [isOpen, goal.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      label: "Milestone 2 is too fast-paced",
      prompt: "Milestone 2's video is moving way too fast and skipping fundamentals. Can you replace it with a beginner-friendly tutorial?"
    },
    {
      label: "Milestone 3 needs hands-on project",
      prompt: "Milestone 3 is too theoretical with lecture slides. Please switch it to a hands-on coding build project tutorial."
    },
    {
      label: "I have a tight 30-min time budget",
      prompt: "My daily study time is limited. The current milestone video is too long. Recommend a concise crash course."
    },
    {
      label: "Find freeCodeCamp / Fireship tutorial",
      prompt: "I learn best from freeCodeCamp or Fireship. Can you find a top-tier video from them for Milestone 1?"
    },
    {
      label: "Explain how Milestone 4 connects to 5",
      prompt: "How does the architecture in Milestone 4 prepare me for the production capstone in Milestone 5?"
    }
  ];

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputValue).trim();
    if (!content || isLoading) return;

    const userMsg: RoadmapCopilotMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/roadmap/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          userMessage: content,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reach Roadmap Copilot");
      }

      const assistantMsg: RoadmapCopilotMessage = {
        id: "ast-" + Date.now(),
        role: "assistant",
        content: data.assistantMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isIssueSignificant: data.isIssueSignificant,
        videoReplacement: data.videoReplacement
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If issue is significant and replacement was provided, auto-apply and trigger celebration
      if (data.isIssueSignificant && data.videoReplacement?.milestoneId) {
        const rep: RoadmapVideoReplacement = data.videoReplacement;
        onUpdateMilestoneVideo(rep.milestoneId, {
          youtubeVideoId: rep.newVideoId,
          youtubeVideoTitle: rep.newVideoTitle,
          youtubeVideoUrl: rep.newVideoUrl
        });

        setAppliedReplacements((prev) => ({
          ...prev,
          [rep.milestoneId]: rep
        }));

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ["#D4AF37", "#F59E0B", "#10B981", "#6366F1"]
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "I ran into a temporary connection issue. However, I remain fully synchronized with your roadmap. Please ask again or try rephrasing!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Luxury Obsidian Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#06080F]/85 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#0F111A] via-[#0A0C14] to-[#07090F] shadow-2xl shadow-amber-950/20 flex flex-col overflow-hidden z-10"
        >
          {/* Champagne & Gold Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-amber-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-indigo-500/10 blur-[90px]" />

          {/* Luxury Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-slate-900/50 to-indigo-950/20 relative z-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="size-full bg-[#0A0C14] rounded-[14px] flex items-center justify-center">
                  <Bot className="size-5 text-amber-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-amber-100 tracking-tight">
                    Roadmap AI Copilot
                  </h2>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="size-2.5 text-amber-400" />
                    OMNISCIENT ROADMAP ACCESS
                  </span>
                </div>
                <p className="text-xs text-foreground/60 flex items-center gap-2 mt-0.5">
                  <span>Tracking: <strong className="text-foreground/90 font-semibold">{goal.title}</strong></span>
                  <span>•</span>
                  <span>{goal.milestones.length} Milestones</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full border border-amber-500/20 bg-slate-900/80 hover:bg-slate-800 text-foreground/60 hover:text-foreground flex items-center justify-center transition-all hover:scale-105"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Prompts Strip */}
          <div className="px-6 py-2.5 bg-black/30 border-b border-white/5 overflow-x-auto flex items-center gap-2 scrollbar-none relative z-10">
            <span className="text-[11px] font-bold text-amber-300/80 flex items-center gap-1 flex-shrink-0">
              <Zap className="size-3 text-amber-400" />
              Quick Issues:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-200/90 hover:text-amber-100 transition-all hover:scale-[1.02] flex-shrink-0 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin relative z-10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="size-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 flex-shrink-0 mt-1 shadow-md shadow-amber-500/10">
                    <div className="size-full bg-[#0A0C14] rounded-[10px] flex items-center justify-center">
                      <Sparkles className="size-4 text-amber-300" />
                    </div>
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-lg shadow-indigo-600/20 rounded-tr-sm ml-auto"
                        : "border border-amber-500/20 bg-gradient-to-b from-[#131622]/90 to-[#0C0E17]/90 text-foreground/90 backdrop-blur-md rounded-tl-sm shadow-xl"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    <div
                      className={`text-[10px] mt-2 flex items-center gap-1 ${
                        msg.role === "user" ? "text-indigo-200 justify-end" : "text-foreground/40"
                      }`}
                    >
                      <Clock className="size-2.5" />
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Video Replacement Luxury Card */}
                  {msg.videoReplacement && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-amber-950/20 p-4 shadow-xl shadow-emerald-950/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                          <CheckCircle2 className="size-3 text-emerald-400" />
                          COMMON LEARNER HURDLE CONFIRMED & RESOLVED
                        </span>
                        <span className="text-[10px] text-foreground/50">
                          Auto-Applied to Milestone
                        </span>
                      </div>

                      {/* Video Diff */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Old Video */}
                        <div className="rounded-xl border border-red-500/20 bg-red-950/15 p-2.5 space-y-1 opacity-70">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                            Replaced Video:
                          </span>
                          <p className="line-through text-foreground/60 line-clamp-2">
                            {msg.videoReplacement.oldVideoTitle}
                          </p>
                        </div>

                        {/* New Video */}
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                              New Recommended Masterclass:
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              ⏱️ {msg.videoReplacement.newVideoDuration}
                            </span>
                          </div>
                          <p className="font-bold text-emerald-200 line-clamp-2">
                            {msg.videoReplacement.newVideoTitle}
                          </p>
                          <div className="text-[10px] text-emerald-300/80">
                            Instructor: <strong>{msg.videoReplacement.newVideoChannel}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <p className="text-[11px] text-foreground/70 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                        💡 <strong>Why this solves your problem:</strong> {msg.videoReplacement.reasoning}
                      </p>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href={msg.videoReplacement.newVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold transition-all hover:scale-105 shadow-md shadow-emerald-500/20"
                        >
                          <Play className="size-3.5 fill-current" />
                          <span>Watch Masterclass on YouTube</span>
                          <ExternalLink className="size-3" />
                        </a>

                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-1">
                          <CheckCircle2 className="size-3.5" />
                          <span>Updated in your active roadmap</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="size-8 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 mt-1 flex items-center justify-center text-foreground/80">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-amber-300">
                <div className="size-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-pulse">
                  <Sparkles className="size-4 text-amber-300" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-amber-500/20 bg-amber-950/20">
                  <div className="size-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Evaluating pedagogical hurdle & checking YouTube course catalog...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-4 sm:p-5 border-t border-amber-500/20 bg-gradient-to-r from-amber-950/10 via-slate-900/60 to-indigo-950/10 relative z-10">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Tell Copilot: 'Milestone 2 is too fast, change to beginner project tutorial'..."
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-amber-500/30 bg-[#080910] px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
              >
                <span>Send</span>
                <Send className="size-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-foreground/40 mt-2 text-center">
              Progress AI Roadmap Copilot evaluates learner difficulties (pacing, syntax, prerequisites) and replaces roadmap videos automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
