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
  FileCheck
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

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All Items" },
    { id: "summary", label: "Summaries" },
    { id: "roadmap", label: "Roadmaps" },
    { id: "note", label: "AI Notes" },
    { id: "code", label: "Code Files" },
    { id: "certificate", label: "Certificates" },
  ];

  const filteredFiles = files.filter((f) => {
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    const matchesSearch =
      f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl h-[85vh] rounded-3xl border border-vault-border bg-vault-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <FolderArchive className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Personal Storage Vault & Artifacts</span>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                    {files.length} Saved Files
                  </span>
                </h2>
                <p className="text-xs text-foreground/60">
                  Instant search across lecture summaries, milestone checklists, and generated notes.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-foreground/60 hover:text-foreground hover:bg-slate-800/60 transition-all"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="px-6 py-3 border-b border-vault-border bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search filenames, tags, or content..."
                className="w-full rounded-xl border border-vault-border bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>

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

          {/* Main Dual-Pane Content */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left File List (5 cols) */}
            <div className="md:col-span-5 border-r border-vault-border overflow-y-auto p-4 space-y-3">
              {filteredFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/50">
                  No files matching your search query.
                </div>
              ) : (
                filteredFiles.map((file) => {
                  const isSelected = activeFile?.id === file.id;
                  return (
                    <InteractiveHoverCard
                      key={file.id}
                      onClick={() => setActiveFile(file)}
                      glowColor="rgba(6, 182, 212, 0.25)"
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-950/20"
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
                        <span className="text-[10px] font-semibold text-foreground/40 whitespace-nowrap">
                          {file.sizeFormatted}
                        </span>
                      </div>

                      {/* Snippet */}
                      <p className="mt-2 text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
                        {file.content.replace(/[#*`_-]/g, "")}
                      </p>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] uppercase font-bold text-cyan-400">
                          {file.category}
                        </span>
                        {file.tags.slice(0, 2).map((t, idx) => (
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

            {/* Right Markdown Preview Pane (7 cols) */}
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
                        Category: {activeFile.category} • Size: {activeFile.sizeFormatted} • Stored locally & pgvector ready
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
