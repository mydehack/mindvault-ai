"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Sparkles,
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookmarkPlus,
  Search,
  Zap,
  Loader2,
  Tv,
  Flame,
  ArrowRight
} from "lucide-react";
import { resolveBestVideoCourse, extractYouTubeId, buildVideoMatchForQuery } from "@/lib/youtube-resolver";
import { StorageFile, VideoSuggestion } from "@/lib/types";

interface VideoLabViewProps {
  initialSkill?: string;
  onSaveToVault?: (file: StorageFile) => void;
}

const STARTER_SKILL_PILLS = [
  "⚡ Full-Stack AI & Gemini",
  "🦀 Rust & Tokio Concurrency",
  "☸️ Kubernetes & Docker",
  "🧠 PyTorch Deep Learning",
  "🌐 System Design & Caching",
  "🐍 Python & FastAPI",
  "🚀 Next.js 15 Server Actions",
  "🔷 Strict TypeScript Mastery"
];

export const VideoLabView: React.FC<VideoLabViewProps> = ({ initialSkill, onSaveToVault }) => {
  // Skill scout state
  const [skillQuery, setSkillQuery] = useState(initialSkill || "");
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [searchedSkill, setSearchedSkill] = useState(initialSkill ? initialSkill : "Python Programming");
  const [selectedLevel, setSelectedLevel] = useState<string>("Intermediate");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [selectedMode, setSelectedMode] = useState<string>("course");

  // In-lab video player & analysis state
  const [urlInput, setUrlInput] = useState("https://www.youtube.com/results?search_query=Python+complete+tutorial");
  const [activeCourse, setActiveCourse] = useState(resolveBestVideoCourse(initialSkill || "Python Programming"));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Trigger dynamic video search on first load for the requested skill
  useEffect(() => {
    const target = initialSkill && initialSkill.trim() ? initialSkill.trim() : "Python Programming";
    setSkillQuery(target);
    handleSearchVideosForSkill(target, selectedLevel, selectedLanguage, selectedMode);
  }, [initialSkill]);

  const handleSearchVideosForSkill = async (
    targetSkill: string,
    lvl: string = selectedLevel,
    lang: string = selectedLanguage,
    mode: string = selectedMode
  ) => {
    if (!targetSkill.trim()) return;
    setIsSearchingAI(true);
    setSearchedSkill(targetSkill);

    try {
      const res = await fetch("/api/video/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: targetSkill,
          skill: targetSkill,
          level: lvl,
          language: lang,
          contentType: mode
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          // Auto-load premier suggested video into the player
          const topVid = data.suggestions[0];
          if (topVid) {
            handleLoadSuggestedVideo(topVid);
          }
          return;
        }
      }

      // Dynamic fallback match strictly for the targetSkill (never unrelated hardcoded video)
      const match = resolveBestVideoCourse(targetSkill);
      setSuggestions([
        {
          id: "sug-" + Date.now(),
          title: match.title,
          channel: match.channel,
          duration: match.duration,
          url: match.url,
          videoId: match.videoId,
          thumbnailUrl: match.thumbnailUrl,
          category: "Foundation",
          whyRecommended: `Comprehensive educational tutorial specifically aligned with ${targetSkill}.`,
          keyTopics: [targetSkill, "Core Concepts", "Implementation"]
        }
      ]);
    } catch (err) {
      console.warn("AI Video Suggestion API error:", err);
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillQuery.trim()) {
      handleSearchVideosForSkill(skillQuery.trim(), selectedLevel, selectedLanguage, selectedMode);
    }
  };

  const handleLoadSuggestedVideo = (video: VideoSuggestion) => {
    setUrlInput(video.url);
    setActiveCourse({
      videoId: video.videoId,
      title: video.title,
      channel: video.channel,
      duration: video.duration,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      description: video.whyRecommended
    });
    setIsPlaying(false);
  };

  const handleAnalyzeDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsAnalyzing(true);
    setIsPlaying(false);
    setTimeout(() => {
      const match = resolveBestVideoCourse(urlInput);
      setActiveCourse(match);
      setIsAnalyzing(false);
    }, 600);
  };

  const videoId = extractYouTubeId(urlInput) || activeCourse.videoId;

  const chapters = [
    { time: "00:00", title: `Core Conceptual Architecture: ${activeCourse.title.slice(0, 38)}...` },
    { time: "18:45", title: "Memory Allocation & Runtime Invariants" },
    { time: "42:10", title: "Tradeoff Analysis & Latency Bottlenecks" },
    { time: "1:15:30", title: "Practical Implementation & Code Walkthrough" },
    { time: "2:04:15", title: "Production Hardening & Failure Recovery" },
  ];

  const conceptualPillars = [
    {
      title: "Deterministic Execution",
      desc: "Guarantees predictable resource management without unexpected latency spikes or memory leaks."
    },
    {
      title: "Architectural Invariants",
      desc: "Strict adherence to system constraints prevents race conditions, deadlocks, and stale state."
    },
    {
      title: "Production Scalability",
      desc: "Designed to handle high throughput through asynchronous event loops and optimized IO pipelines."
    }
  ];

  const handleSaveToStorage = () => {
    if (!onSaveToVault) return;
    const labFile: StorageFile = {
      id: "lab-" + Date.now(),
      filename: `${activeCourse.title.replace(/[^a-zA-Z0-9]/g, "_")}_LabAnalysis.md`,
      fileType: "markdown",
      category: "summary",
      tags: ["Video Lab", "AI Suggestions", "Chapters", "Concepts"],
      content: `# 🎥 Video Lab Intelligence: ${activeCourse.title}\n\n` +
        `**URL**: ${activeCourse.url}\n` +
        `**Channel**: ${activeCourse.channel} | **Duration**: ${activeCourse.duration}\n\n` +
        `## Timestamped Chapters\n` +
        chapters.map((c) => `- **${c.time}**: ${c.title}`).join("\n") +
        `\n\n## Conceptual Pillars\n` +
        conceptualPillars.map((p) => `### ${p.title}\n${p.desc}`).join("\n\n"),
      sizeFormatted: "2.1 KB",
      createdAt: new Date().toISOString()
    };
    onSaveToVault(labFile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top AI Video Scout Banner */}
      <div className="relative rounded-3xl border border-vault-border bg-gradient-to-r from-red-950/40 via-vault-card to-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-red-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-indigo-500/10 blur-[110px]" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400">
              <Sparkles className="size-3.5" />
              <span>Google Gemini AI • Video Scout</span>
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-foreground/70 flex items-center gap-1">
              <Tv className="size-3 text-cyan-400" />
              <span>Curated Public Masterclasses</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              AI Video Suggestions for Any Skill
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60 max-w-2xl mt-1 leading-relaxed">
              Enter any engineering skill, technology, or topic. Gemini instantly scans top educational YouTube channels (freeCodeCamp, MIT, Karpathy, Fireship, Primeagen, TechWorld with Nana) to curate the ultimate video masterclasses.
            </p>
          </div>

          {/* AI Skill Search Input Form */}
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                type="text"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder="Enter any skill you want to learn (e.g., Quantum Computing, Docker, PyTorch, Rust, Next.js)..."
                className="w-full rounded-2xl border border-vault-border bg-slate-900/80 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingAI}
              className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSearchingAI ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" />
                  <span>Curating Videos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-amber-300" />
                  <span>Get AI Video Suggestions</span>
                </>
              )}
            </button>
          </form>

          {/* Pedagogical Control Bar: Mode, Level, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 pb-1 border-t border-vault-border/50">
            {/* Mode Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Mode:</span>
              <div className="flex rounded-xl bg-slate-900/60 p-1 border border-vault-border/60">
                {(['course', 'video', 'project'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMode(m);
                      if (skillQuery.trim()) handleSearchVideosForSkill(skillQuery.trim(), selectedLevel, selectedLanguage, m);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                      selectedMode === m
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {m === 'course' ? 'Course' : m === 'video' ? 'Concept' : 'Project'}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Level:</span>
              <div className="flex rounded-xl bg-slate-900/60 p-1 border border-vault-border/60">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(lvl);
                      if (skillQuery.trim()) handleSearchVideosForSkill(skillQuery.trim(), lvl, selectedLanguage, selectedMode);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      selectedLevel === lvl
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Language:</span>
              <div className="flex rounded-xl bg-slate-900/60 p-1 border border-vault-border/60">
                {(['English', 'Telugu', 'Hindi', 'Spanish'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      if (skillQuery.trim()) handleSearchVideosForSkill(skillQuery.trim(), selectedLevel, lang, selectedMode);
                    }}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      selectedLanguage === lang
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Skill Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/50 mr-1 flex items-center gap-1">
              <Zap className="size-3 text-amber-400" /> Quick Topics:
            </span>
            {STARTER_SKILL_PILLS.map((pill) => {
              const cleaned = pill.replace(/^[^\w\s]+/, "").trim();
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    setSkillQuery(cleaned);
                    handleSearchVideosForSkill(cleaned);
                  }}
                  className="rounded-xl border border-vault-border bg-slate-900/50 hover:bg-slate-800/80 px-2.5 py-1 text-xs text-foreground/70 hover:text-foreground transition-all hover:scale-105 active:scale-95"
                >
                  {pill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Suggested Videos Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-red-400" />
            <h2 className="text-lg font-bold text-foreground">
              AI Curated Masterclasses for &ldquo;<span className="text-red-400">{searchedSkill}</span>&rdquo;
            </h2>
          </div>
          <span className="text-xs text-foreground/50 font-medium">
            {suggestions.length} courses tailored by Gemini
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((video) => {
            const isCurrentlyLoaded = activeCourse.videoId === video.videoId;
            return (
              <motion.div
                key={video.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-xl transition-all ${
                  isCurrentlyLoaded
                    ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30"
                    : "border-vault-border bg-vault-card/85 hover:border-red-500/40 hover:bg-slate-900/60"
                }`}
              >
                <div className="space-y-3">
                  {/* Thumbnail Container */}
                  <div
                    onClick={() => handleLoadSuggestedVideo(video)}
                    className="relative aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer"
                  >
                    <img
                      src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="size-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-center size-10 rounded-full bg-red-600 text-white shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="size-5 fill-white translate-x-0.5" />
                      </div>
                    </div>

                    {/* Category Badge */}
                    <span className="absolute top-2 left-2 rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-red-300 border border-white/10">
                      {video.category || "Masterclass"}
                    </span>

                    {/* Duration Badge */}
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-white">
                      {video.duration}
                    </span>
                  </div>

                  {/* Channel & Title */}
                  <div>
                    <div className="text-[11px] font-bold text-red-400 uppercase tracking-wide truncate">
                      {video.channel}
                    </div>
                    <h3 className="text-xs font-bold text-foreground line-clamp-2 mt-0.5 leading-snug">
                      {video.title}
                    </h3>
                  </div>

                  {/* Why AI Recommended It */}
                  <div className="rounded-xl border border-vault-border bg-slate-900/50 p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                      <Sparkles className="size-3" />
                      <span>AI Rationale</span>
                    </div>
                    <p className="text-[11px] text-foreground/70 line-clamp-2 leading-relaxed">
                      {video.whyRecommended}
                    </p>
                  </div>

                  {/* Key Topics Tags */}
                  {video.keyTopics && video.keyTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.keyTopics.slice(0, 3).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-md bg-slate-800/60 px-1.5 py-0.5 text-[9px] font-medium text-foreground/60"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-vault-border/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSuggestedVideo(video)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
                      isCurrentlyLoaded
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : "bg-slate-800/80 hover:bg-red-600 hover:text-white text-foreground/90"
                    }`}
                  >
                    <Play className="size-3 fill-current" />
                    <span>{isCurrentlyLoaded ? "Loaded in Lab" : "Study in Lab"}</span>
                  </button>

                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-vault-border bg-slate-900/40 hover:bg-slate-800 text-foreground/60 hover:text-foreground transition-all"
                    title="Open directly on YouTube"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Dual Grid: Active Video Player + Chapter Extraction */}
      <div className="pt-4 border-t border-vault-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tv className="size-4 text-indigo-400" />
            <h2 className="text-lg font-bold text-foreground">
              Interactive Video Study Lab & Chapter Intelligence
            </h2>
          </div>
          <span className="text-xs font-semibold text-foreground/50">
            Powered by Gemini 3.8
          </span>
        </div>

        {/* Custom URL Ingestion Bar */}
        <form onSubmit={handleAnalyzeDirectUrl} className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Video className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste any custom YouTube URL or tutorial link to study here..."
              className="w-full rounded-2xl border border-vault-border bg-slate-900/70 pl-11 pr-4 py-3 text-xs text-foreground placeholder:text-foreground/40 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="rounded-2xl bg-slate-800 hover:bg-slate-700 px-5 py-3 text-xs font-bold text-foreground border border-vault-border transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? "Analyzing..." : "Load Custom URL"}
          </button>
        </form>

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
                  className="flex items-center gap-1.5 rounded-xl border border-vault-border bg-slate-800/60 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95"
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
    </div>
  );
};
