"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FolderArchive,
  Search,
  FileText,
  Download,
  Copy,
  Check,
  Tag,
  Calendar,
  Sparkles,
  ExternalLink,
  Code2,
  BookmarkCheck,
  FileCheck,
  Brain,
  HelpCircle,
  MessageSquare,
  Send,
  Zap,
  ArrowRight
} from "lucide-react";
import { StorageFile } from "@/lib/types";
import { InteractiveHoverCard } from "@/components/ui/interactive-hover-card";

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: StorageFile[];
  onAddFile?: (file: StorageFile) => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  files,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeFile, setActiveFile] = useState<StorageFile | null>(files[0] || null);
  const [copied, setCopied] = useState(false);

  // AI Search states
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState<string | null>(null);
  const [aiRankings, setAiRankings] = useState<Record<string, { matchScore: number; rationale: string; keySnippet: string }>>({});
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [isAiModeActive, setIsAiModeActive] = useState(false);

  // Document Q&A states
  const [docQuestion, setDocQuestion] = useState("");
  const [isAskingDoc, setIsAskingDoc] = useState(false);
  const [docAnswer, setDocAnswer] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All Items" },
    { id: "summary", label: "Summaries" },
    { id: "roadmap", label: "Roadmaps" },
    { id: "note", label: "AI Notes" },
    { id: "code", label: "Code Files" },
    { id: "certificate", label: "Certificates" },
  ];

  // Trigger Gemini 3.8 Flash AI Semantic Search
  const handleAiSearch = async (queryText?: string) => {
    const q = queryText || searchTerm;
    if (!q.trim()) return;

    setIsAiSearching(true);
    setIsAiModeActive(true);
    setSearchTerm(q);

    try {
      const res = await fetch("/api/vault/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, files })
      });

      const data = await res.json();
      if (data.success) {
        setAiSynthesis(data.aiSynthesis);
        setSuggestedQueries(data.suggestedQueries || []);

        const rankingsMap: Record<string, { matchScore: number; rationale: string; keySnippet: string }> = {};
        (data.rankedFiles || []).forEach((item: any) => {
          rankingsMap[item.id] = {
            matchScore: item.matchScore,
            rationale: item.rationale,
            keySnippet: item.keySnippet
          };
        });
        setAiRankings(rankingsMap);

        // If there is a top match, select it
        if (data.rankedFiles && data.rankedFiles.length > 0) {
          const topFile = files.find(f => f.id === data.rankedFiles[0].id);
          if (topFile) setActiveFile(topFile);
        }
      }
    } catch (err) {
      console.error("AI Vault search error:", err);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Ask Question to Selected File via Gemini 3.8 Flash
  const handleAskDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile || !docQuestion.trim() || isAskingDoc) return;

    setIsAskingDoc(true);
    try {
      const res = await fetch("/api/vault/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          askFile: true,
          fileName: activeFile.filename,
          fileContent: activeFile.content,
          question: docQuestion.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setDocAnswer(data.answer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingDoc(false);
    }
  };

  const handleClearAiSearch = () => {
    setSearchTerm("");
    setIsAiModeActive(false);
    setAiSynthesis(null);
    setAiRankings({});
    setSuggestedQueries([]);
  };

  // Filter and sort files (prioritizing AI matchScore if active)
  let displayedFiles = files.filter((f) => {
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    if (!isAiModeActive && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      const matchesSearch =
        f.filename.toLowerCase().includes(lower) ||
        f.content.toLowerCase().includes(lower) ||
        f.tags.some((t) => t.toLowerCase().includes(lower));
      return matchesCategory && matchesSearch;
    }
    return matchesCategory;
  });

  if (isAiModeActive && Object.keys(aiRankings).length > 0) {
    displayedFiles = [...displayedFiles].sort((a, b) => {
      const scoreA = aiRankings[a.id]?.matchScore || 0;
      const scoreB = aiRankings[b.id]?.matchScore || 0;
      return scoreB - scoreA;
    });
  }

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (file: StorageFile) => {
    const element = document.createElement("a");
    const blob = new Blob([file.content], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(blob);
    element.download = file.filename.endsWith(".md") ? file.filename : `${file.filename}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-6xl h-[88vh] rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <FolderArchive className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Progress Storage Vault & AI Search</span>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30">
                    {files.length} Saved Files
                  </span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Sparkles className="size-3 text-indigo-400" />
                    Gemini 3.8 Flash
                  </span>
                </h2>
                <p className="text-xs text-foreground/60">
                  Semantic natural language search across lecture summaries, milestone checklists, and personal code.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-slate-800 transition-all"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* AI Search & Category Filter Bar */}
          <div className="px-6 py-3 border-b border-vault-border bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input with AI Trigger */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSearch();
              }}
              className="relative w-full sm:w-[480px] flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ask anything (e.g., 'How do we handle Tokio mutexes?' or 'Redis cache')..."
                  className="w-full rounded-xl border border-vault-border bg-slate-900/80 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearAiSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isAiSearching || !searchTerm.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 disabled:opacity-50 transition-all flex-shrink-0"
              >
                {isAiSearching ? (
                  <>
                    <div className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>AI Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5 text-amber-300" />
                    <span>Ask AI Vault</span>
                  </>
                )}
              </button>
            </form>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40"
                      : "text-foreground/60 hover:text-foreground hover:bg-slate-800/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Knowledge Synthesis Box (Shows when AI search runs) */}
          {aiSynthesis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-6 py-4 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-cyan-950/40 border-b border-indigo-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex-shrink-0 mt-0.5">
                  <Brain className="size-4" />
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="size-3 text-amber-400" />
                      <span>AI Knowledge Synthesis: &quot;{searchTerm}&quot;</span>
                    </span>
                    <button
                      onClick={() => setAiSynthesis(null)}
                      className="text-xs text-foreground/40 hover:text-foreground"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                    {aiSynthesis}
                  </div>

                  {/* Suggested Follow-up Questions */}
                  {suggestedQueries.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground/50">Follow-up:</span>
                      {suggestedQueries.map((sq, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAiSearch(sq)}
                          className="rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 text-[11px] text-indigo-300 transition-colors"
                        >
                          💬 {sq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Dual-Pane Content */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left File List (5 cols) */}
            <div className="md:col-span-5 border-r border-vault-border overflow-y-auto p-4 space-y-3">
              {displayedFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/50">
                  No files matching your search query. Try asking AI Vault with different terms.
                </div>
              ) : (
                displayedFiles.map((file) => {
                  const isSelected = activeFile?.id === file.id;
                  const aiInfo = aiRankings[file.id];

                  return (
                    <InteractiveHoverCard
                      key={file.id}
                      onClick={() => {
                        setActiveFile(file);
                        setDocAnswer(null);
                      }}
                      glowColor="rgba(6, 182, 212, 0.25)"
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-cyan-500/60 bg-cyan-500/10 shadow-md shadow-cyan-950/20"
                          : "border-vault-border bg-slate-900/40 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className={`size-4 flex-shrink-0 ${isSelected ? "text-cyan-400" : "text-foreground/60"}`} />
                          <span className="text-xs font-bold text-foreground truncate">
                            {file.filename}
                          </span>
                        </div>

                        {/* AI Match Score Badge */}
                        {aiInfo ? (
                          <span className="flex-shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            {aiInfo.matchScore}% Match
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-foreground/40 whitespace-nowrap">
                            {file.sizeFormatted}
                          </span>
                        )}
                      </div>

                      {/* AI Rationale / Key Snippet */}
                      {aiInfo?.rationale && (
                        <div className="mt-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2 text-[11px] text-indigo-300">
                          <span className="font-semibold text-amber-300">Why it matches:</span> {aiInfo.rationale}
                        </div>
                      )}

                      {/* Snippet */}
                      <p className="mt-2 text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
                        {aiInfo?.keySnippet || file.content.replace(/[#*`_-]/g, "")}
                      </p>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] uppercase font-bold text-cyan-400">
                          {file.category}
                        </span>
                        {file.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-800/50 px-1.5 py-0.5 text-[9px] text-foreground/60"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </InteractiveHoverCard>
                  );
                })
              )}
            </div>

            {/* Right Markdown Preview Pane & Document AI Assistant (7 cols) */}
            <div className="md:col-span-7 flex flex-col h-full bg-slate-950/40 overflow-hidden">
              {activeFile ? (
                <>
                  {/* File Preview Header */}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-vault-border bg-slate-900/50">
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-2">
                        <FileCheck className="size-4 text-emerald-400" />
                        <span>{activeFile.filename}</span>
                      </div>
                      <div className="text-[10px] text-foreground/50">
                        Category: {activeFile.category} • Size: {activeFile.sizeFormatted} • Stored in Progress Vault
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-lg border border-vault-border bg-slate-800/60 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-foreground/80 hover:text-foreground transition-all"
                        title="Copy Markdown"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        onClick={() => handleDownload(activeFile)}
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
                        title="Download Markdown File"
                      >
                        <Download className="size-3.5" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Markdown Content Area */}
                  <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed select-text">
                    {activeFile.content}
                  </div>

                  {/* Ask AI About This File Drawer */}
                  <div className="p-4 border-t border-vault-border bg-slate-900/70 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <MessageSquare className="size-3.5 text-indigo-400" />
                        <span>Ask AI about &quot;{activeFile.filename}&quot;</span>
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                        Gemini 3.8 Flash
                      </span>
                    </div>

                    {/* AI Answer Box */}
                    {docAnswer && (
                      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-xs text-foreground/90 whitespace-pre-wrap">
                        {docAnswer}
                      </div>
                    )}

                    <form onSubmit={handleAskDoc} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={docQuestion}
                        onChange={(e) => setDocQuestion(e.target.value)}
                        placeholder={`Ask AI a question about this document...`}
                        className="flex-1 rounded-xl border border-vault-border bg-slate-900/90 px-3.5 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isAskingDoc || !docQuestion.trim()}
                        className="flex items-center justify-center size-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-40"
                      >
                        {isAskingDoc ? (
                          <div className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-foreground/40 text-xs">
                  <FileText className="size-8 mb-2 opacity-50" />
                  <span>Select a file on the left to preview its content</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
