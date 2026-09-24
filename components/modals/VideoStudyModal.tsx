"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Video,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  BookOpen,
  Code,
  HelpCircle,
  FileText,
  Save,
  Check,
  FolderPlus,
  Play
} from "lucide-react";
import { Milestone, StorageFile } from "@/lib/types";
import { generateVideoNotesAI, generateVideoSummaryAI } from "@/lib/gemini";
import confetti from "canvas-confetti";

interface VideoStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone;
  onCompleteVideo: (milestoneId: string, summaryFile: StorageFile) => void;
  onSaveNoteToStorage: (file: StorageFile) => void;
}

export const VideoStudyModal: React.FC<VideoStudyModalProps> = ({
  isOpen,
  onClose,
  milestone,
  onCompleteVideo,
  onSaveNoteToStorage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [activeNoteType, setActiveNoteType] = useState<"takeaways" | "syntaxes" | "flashcards" | "executive">("takeaways");
  const [generatedNotes, setGeneratedNotes] = useState<string>("");
  const [isSavedToStorage, setIsSavedToStorage] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  if (!isOpen) return null;

  const videoId = milestone.youtubeVideoId || "MsocPEZBd-M";
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  const handleGenerateNotes = async (type: "takeaways" | "syntaxes" | "flashcards" | "executive") => {
    setActiveNoteType(type);
    setIsGeneratingNotes(true);
    setIsSavedToStorage(false);
    try {
      const notes = await generateVideoNotesAI(milestone.youtubeVideoTitle || milestone.title, type);
      setGeneratedNotes(notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleSaveNotes = () => {
    if (!generatedNotes) return;
    const noteFile: StorageFile = {
      id: "note-" + Date.now(),
      filename: `${milestone.title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.md`,
      fileType: "markdown",
      category: "note",
      tags: ["AI Notes", activeNoteType, "Milestone " + milestone.dayNumber],
      content: generatedNotes,
      sizeFormatted: `${(generatedNotes.length / 1024).toFixed(1)} KB`,
      createdAt: new Date().toISOString()
    };
    onSaveNoteToStorage(noteFile);
    setIsSavedToStorage(true);
    setTimeout(() => setIsSavedToStorage(false), 3000);
  };

  const handleMarkAsCompleted = async () => {
    setIsMarkingCompleted(true);
    try {
      // 1. Fire Confetti
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 }
      });

      // 2. Auto-generate distilled video summary
      const summaryContent = await generateVideoSummaryAI(
        milestone.youtubeVideoTitle || milestone.title,
        milestone.timeEstimate || "45 min"
      );

      const summaryFile: StorageFile = {
        id: "sum-" + Date.now(),
        filename: `${milestone.title.replace(/[^a-zA-Z0-9]/g, "_")}_Summary.md`,
        fileType: "markdown",
        category: "summary",
        tags: ["Lecture Summary", "Auto-Generated", "Verified"],
        content: summaryContent,
        sizeFormatted: `${(summaryContent.length / 1024).toFixed(1)} KB`,
        createdAt: new Date().toISOString()
      };

      // 3. Auto-tick checkbox & add to storage
      onCompleteVideo(milestone.id, summaryFile);
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl h-[90vh] rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                <Video className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>{milestone.youtubeVideoTitle || milestone.title}</span>
                  {milestone.isVideoWatched && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Completed
                    </span>
                  )}
                </h2>
                <p className="text-xs text-foreground/60">
                  Day {milestone.dayNumber} Milestone • Est. Time: {milestone.timeEstimate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* External YouTube Link */}
              <a
                href={milestone.youtubeVideoUrl || `https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-vault-border bg-slate-800/60 hover:bg-slate-700 px-3 py-1.5 text-xs text-foreground/80 hover:text-foreground transition-all"
              >
                <span>Best Video Link</span>
                <ExternalLink className="size-3.5" />
              </a>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-slate-800 transition-all"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Body (2 Columns) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left: Video Player & Milestone Context (7 Cols) */}
            <div className="lg:col-span-7 p-6 border-r border-vault-border flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                {/* Embedded Video Player */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-vault-border bg-black shadow-lg">
                  {isPlaying ? (
                    <iframe
                      src={embedUrl}
                      title={milestone.youtubeVideoTitle}
                      className="size-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative size-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={milestone.title}
                        className="size-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-center justify-center size-16 rounded-full bg-red-600/90 text-white shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="size-8 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Milestone Details & Mental Models */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{milestone.title}</h3>
                  <p className="text-xs text-foreground/70 leading-relaxed">{milestone.description}</p>
                </div>

                {/* Mental Model Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {milestone.mentalModels?.map((mm, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold text-indigo-300"
                    >
                      ⚡ {mm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Complete Video Action Button */}
              <div className="pt-6 border-t border-vault-border mt-6">
                <button
                  onClick={handleMarkAsCompleted}
                  disabled={isMarkingCompleted}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs font-bold transition-all shadow-lg ${
                    milestone.isVideoWatched
                      ? "bg-emerald-600 text-white shadow-emerald-600/25"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-[1.01] active:scale-[0.99] shadow-emerald-600/25"
                  }`}
                >
                  <CheckCircle2 className="size-4" />
                  <span>
                    {milestone.isVideoWatched
                      ? "Lecture Completed (Regenerate & Re-save Summary)"
                      : "Mark Video Completed (+100 XP, Auto-Tick Checkbox & Auto-Save Summary)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: AI Note Generating Bar & Live Notes (5 Cols) */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-slate-950/30 overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* AI Note Generating Bar Title */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-indigo-400" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      AI Note Generating Bar
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Gemini 3.8 Flash
                  </span>
                </div>

                {/* 1-Click Note Presets Bar */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => handleGenerateNotes("takeaways")}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                      activeNoteType === "takeaways"
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                        : "border-vault-border bg-slate-900/40 text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="size-3.5 text-indigo-400" />
                    <span>Key Takeaways</span>
                  </button>

                  <button
                    onClick={() => handleGenerateNotes("syntaxes")}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                      activeNoteType === "syntaxes"
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                        : "border-vault-border bg-slate-900/40 text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <Code className="size-3.5 text-cyan-400" />
                    <span>Code & Syntaxes</span>
                  </button>

                  <button
                    onClick={() => handleGenerateNotes("flashcards")}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                      activeNoteType === "flashcards"
                        ? "border-amber-500 bg-amber-500/20 text-amber-300"
                        : "border-vault-border bg-slate-900/40 text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <HelpCircle className="size-3.5 text-amber-400" />
                    <span>Active Flashcards</span>
                  </button>

                  <button
                    onClick={() => handleGenerateNotes("executive")}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-medium transition-all ${
                      activeNoteType === "executive"
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-vault-border bg-slate-900/40 text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <FileText className="size-3.5 text-purple-400" />
                    <span>Executive Summary</span>
                  </button>
                </div>

                {/* Notes Display Box */}
                <div className="flex-1 rounded-2xl border border-vault-border bg-slate-900/50 p-4 overflow-y-auto font-mono text-xs text-foreground/90 leading-relaxed select-text">
                  {isGeneratingNotes ? (
                    <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-3">
                      <div className="size-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                      <span className="text-xs font-sans text-foreground/60">
                        Synthesizing high-yield notes with Gemini 3.8 Flash...
                      </span>
                    </div>
                  ) : generatedNotes ? (
                    <div className="whitespace-pre-wrap">{generatedNotes}</div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-foreground/40 text-xs text-center font-sans space-y-2">
                      <Sparkles className="size-6 text-indigo-400/40" />
                      <span>Click any preset above to generate high-yield notes for this video.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Click Save Note to Storage Vault */}
              {generatedNotes && (
                <div className="pt-4 mt-2">
                  <button
                    onClick={handleSaveNotes}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {isSavedToStorage ? (
                      <>
                        <Check className="size-4 text-emerald-300" />
                        <span>Saved to Personal Storage Vault!</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="size-4" />
                        <span>Save Notes into Storage Vault</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
