"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Sparkles,
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BookmarkPlus
} from "lucide-react";
import { resolveBestVideoCourse, extractYouTubeId } from "@/lib/youtube-resolver";
import { StorageFile } from "@/lib/types";

interface VideoLabViewProps {
  onSaveToVault?: (file: StorageFile) => void;
}

export const VideoLabView: React.FC<VideoLabViewProps> = ({ onSaveToVault }) => {
  const [urlInput, setUrlInput] = useState("https://www.youtube.com/watch?v=MsocPEZBd-M");
  const [activeCourse, setActiveCourse] = useState(resolveBestVideoCourse("Rust"));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsAnalyzing(true);
    setIsPlaying(false);
    setTimeout(() => {
      const match = resolveBestVideoCourse(urlInput);
      setActiveCourse(match);
      setIsAnalyzing(false);
    }, 700);
  };

  const videoId = extractYouTubeId(urlInput) || activeCourse.videoId;

  const chapters = [
    { time: "00:00", title: "Core Execution Model & Zero-Cost Abstractions" },
    { time: "18:45", title: "Stack vs Heap Allocations & Ownership Rules" },
    { time: "42:10", title: "Borrow Checker Invariants & Lifetime Elision" },
    { time: "1:15:30", title: "Tokio Async Event Loop & Cooperative Multitasking" },
    { time: "2:04:15", title: "Production Thread Safety & Arc<Mutex<T>> Synchronization" },
  ];

  const conceptualPillars = [
    { title: "Deterministic Cleanup", desc: "RAII pattern frees heap resources immediately when stack variable goes out of scope." },
    { title: "Single-Writer Exclusive Mutability", desc: "Aliases can read concurrently (&T), but mutations require exclusive borrow (&mut T)." },
    { title: "Zero Runtime Garbage Collection", desc: "Compiles to native machine instructions without stop-the-world latency spikes." },
  ];

  const handleSaveToStorage = () => {
    if (!onSaveToVault) return;
    const labFile: StorageFile = {
      id: "lab-" + Date.now(),
      filename: `${activeCourse.title.replace(/[^a-zA-Z0-9]/g, "_")}_LabAnalysis.md`,
      fileType: "markdown",
      category: "summary",
      tags: ["Video Lab", "Chapters", "Concepts"],
      content: `# 🎥 Video Lab Intelligence: ${activeCourse.title}\n\n` +
        `**URL**: ${activeCourse.url}\n` +
        `**Channel**: ${activeCourse.channel} | **Duration**: ${activeCourse.duration}\n\n` +
        `## Timestamped Chapters\n` +
        chapters.map((c) => `- **${c.time}**: ${c.title}`).join("\n") +
        `\n\n## Conceptual Pillars\n` +
        conceptualPillars.map((p) => `### ${p.title}\n${p.desc}`).join("\n\n"),
      sizeFormatted: "1.8 KB",
      createdAt: new Date().toISOString()
    };
    onSaveToVault(labFile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-vault-border bg-gradient-to-r from-red-950/30 via-vault-card to-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div>
          <span className="rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400">
            Gemini 3.8 Flash • Video Intelligence Lab
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-3">
            Public YouTube & Lecture Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60 max-w-xl mt-1">
            Ingest public YouTube tutorials or lecture transcripts to generate timestamped chapters, conceptual invariants, and active-recall quizzes.
          </p>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleAnalyze} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Video className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste public YouTube URL or engineering topic..."
              className="w-full rounded-2xl border border-vault-border bg-slate-900/70 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="rounded-2xl bg-red-600 hover:bg-red-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? "Analyzing Video..." : "Analyze Lecture"}
          </button>
        </form>
      </div>

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Player & Meta (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-vault-border bg-black shadow-xl">
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={activeCourse.title}
                className="size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                className="relative size-full group cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={activeCourse.title}
                  className="size-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-center justify-center size-16 rounded-full bg-red-600 text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="size-8 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata Card */}
          <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20">
                {activeCourse.channel} • {activeCourse.duration}
              </span>

              <button
                onClick={handleSaveToStorage}
                className="flex items-center gap-1.5 rounded-xl border border-vault-border bg-slate-800/60 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground transition-all"
              >
                <BookmarkPlus className="size-3.5 text-cyan-400" />
                <span>{savedSuccess ? "Saved to Vault!" : "Save Analysis to Vault"}</span>
              </button>
            </div>

            <h2 className="text-lg font-bold text-foreground">{activeCourse.title}</h2>
            <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
              {activeCourse.description}
            </p>
          </div>
        </div>

        {/* Right: Timestamped Chapters & Conceptual Pillars (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Timestamped Chapters */}
          <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Clock className="size-4 text-cyan-400" />
              <span>Timestamped High-Yield Chapters</span>
            </h3>

            <div className="space-y-2">
              {chapters.map((chap, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-vault-border bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer transition-all text-xs"
                >
                  <span className="font-semibold text-foreground/80 truncate">{chap.title}</span>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                    {chap.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conceptual Pillars */}
          <div className="rounded-3xl border border-vault-border bg-vault-card/85 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-400" />
              <span>Core Conceptual Pillars</span>
            </h3>

            <div className="space-y-3">
              {conceptualPillars.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-1">
                  <div className="text-xs font-bold text-indigo-300">{p.title}</div>
                  <p className="text-[11px] text-foreground/60 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
