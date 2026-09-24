"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Search,
  UploadCloud,
  FileCode,
  FileText,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
  Plus
} from "lucide-react";
import { VaultMemory } from "@/lib/types";
import { InteractiveHoverCard } from "@/components/ui/interactive-hover-card";

interface MemoryVaultViewProps {
  onAddMemory?: (memory: VaultMemory) => void;
}

const INITIAL_MEMORIES: VaultMemory[] = [
  {
    id: "mem-1",
    title: "Rust Async Runtime & Tokio Mutex vs Std Mutex",
    category: "code",
    content: `// Tokio async-aware mutex prevents worker thread blocking\nuse tokio::sync::Mutex;\nuse std::sync::Arc;\n\n#[tokio::main]\nasync fn main() {\n    let counter = Arc::new(Mutex::new(0));\n    let mut handles = vec![];\n    for _ in 0..10 {\n        let c = Arc::clone(&counter);\n        handles.push(tokio::spawn(async move {\n            let mut num = c.lock().await;\n            *num += 1;\n        }));\n    }\n    for h in handles { h.await.unwrap(); }\n    println!("Result: {}", *counter.lock().await);\n}`,
    summary: "tokio::sync::Mutex yields the thread back to the runtime while waiting, avoiding thread starvation under high async concurrency.",
    tags: ["Rust", "Tokio", "Concurrency", "Mutex"],
    similarity: 96,
    relevanceRationale: "Directly implements async non-blocking synchronization in Tokio using Arc and Mutex primitives.",
    createdAt: "2026-09-20T10:00:00Z"
  },
  {
    id: "mem-2",
    title: "Redis Cache Stampede Mitigation (Single-Flight Pattern)",
    category: "note",
    content: `Cache stampede occurs when high-frequency cached keys expire simultaneously.
Solution:
1. Probabilistic Early Invalidation (XFetch)
2. Mutex single-flight regeneration: only 1 request repopulates DB cache while remaining requests wait on the in-flight channel.`,
    summary: "Single-flight mutex pattern eliminates the thundering herd problem during cache key expiration.",
    tags: ["Distributed Systems", "Redis", "Caching", "Performance"],
    similarity: 92,
    relevanceRationale: "Explains architectural mitigation techniques for cache invalidation stampedes.",
    createdAt: "2026-09-21T12:00:00Z"
  },
  {
    id: "mem-3",
    title: "Python Loops, Generators & Memory Iterators",
    category: "code",
    content: `def stream_large_dataset(filepath: str):\n    \"\"\"Generator function saves memory by yielding lines lazily.\"\"\"\n    with open(filepath, 'r', encoding='utf-8') as f:\n        for line in f:\n            if line.strip():\n                yield line.strip()\n\n# Consuming generator with minimal memory footprint\nfor record in stream_large_dataset("metrics.log"):\n    process(record)`,
    summary: "Python generator functions yield values lazily on demand without loading large files into RAM.",
    tags: ["Python", "Generators", "Loops", "Memory"],
    similarity: 88,
    relevanceRationale: "Demonstrates memory-efficient looping and iterator generators in Python.",
    createdAt: "2026-09-22T14:30:00Z"
  },
  {
    id: "mem-4",
    title: "Google Gemini 3.8 Flash Streaming & Function Calling Architecture",
    category: "summary",
    content: `Gemini 3.8 Flash supports structured JSON schemas, tool definitions, and bidirectional streaming.
Key advantage: 1M token context window allows ingesting entire git repos into the prompt without retrieval latency.`,
    summary: "Architectural summary of Gemini 3.8 Flash agentic capabilities and 1M token multimodal context.",
    tags: ["Gemini 3.8", "AI", "Agentic", "LLM"],
    similarity: 98,
    relevanceRationale: "Matches queries about Gemini API routing, token budgets, and agentic workflows.",
    createdAt: "2026-09-23T09:15:00Z"
  }
];

export const MemoryVaultView: React.FC<MemoryVaultViewProps> = () => {
  const [memories, setMemories] = useState<VaultMemory[]>(INITIAL_MEMORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      // Simulate vector semantic search re-ranking
      const q = searchQuery.toLowerCase();
      const updated = memories.map((m) => {
        let sim = 70;
        if (m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)) {
          sim = 94 + Math.floor(Math.random() * 5);
        } else if (m.tags.some((t) => t.toLowerCase().includes(q))) {
          sim = 85 + Math.floor(Math.random() * 8);
        } else {
          sim = 60 + Math.floor(Math.random() * 20);
        }
        return {
          ...m,
          similarity: sim,
          relevanceRationale: `Semantic vector distance to "${searchQuery}" is high due to overlapping conceptual representations in ${m.tags.join(', ')}.`
        };
      });
      updated.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      setMemories(updated);
      setIsSearching(false);
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const newMem: VaultMemory = {
        id: "mem-" + Date.now(),
        title: file.name,
        category: file.name.endsWith(".md") ? "note" : file.name.endsWith(".py") || file.name.endsWith(".ts") ? "code" : "pdf",
        content: `// Ingested file: ${file.name}\n// Chunked & Embedded via Gemini embedding-2 model into Supabase pgvector table.`,
        summary: `Extracted content from ${file.name}. Ready for semantic vector retrieval.`,
        tags: ["Ingested", file.name.split('.').pop() || "doc"],
        similarity: 100,
        relevanceRationale: "Just ingested into personal vector store with 768-dim embeddings.",
        createdAt: new Date().toISOString()
      };
      setMemories([newMem, ...memories]);
    }
  };

  const filtered = memories.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-vault-border bg-gradient-to-r from-cyan-950/40 via-vault-card to-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-400">
                Vector Semantic Search • pgvector
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Digital Memory Vault
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60 max-w-xl mt-1">
              "Finds What You Forget". Query using plain natural language to retrieve exact code snippets, notes, and architectural summaries.
            </p>
          </div>
          <div className="text-right sm:border-l border-vault-border sm:pl-6">
            <div className="text-2xl font-black text-cyan-400">{memories.length}</div>
            <div className="text-[11px] text-foreground/50 uppercase font-bold">Embedded Items</div>
          </div>
        </div>

        {/* Natural Language Vector Search Bar */}
        <form onSubmit={handleSearch} className="mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 'Show me that Python code I wrote when I was learning loops' or 'tokio mutex'"
              className="w-full rounded-2xl border border-vault-border bg-slate-900/70 pl-12 pr-32 py-4 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner transition-all"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
            >
              {isSearching ? "Searching..." : "Vector Search"}
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Source Ingestion Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
            : "border-vault-border bg-slate-900/30 hover:border-cyan-500/50 hover:bg-slate-900/50"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-inner">
            <UploadCloud className="size-7" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">
              Multi-Source Ingestion Dropzone
            </div>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              Drag & drop PDFs, markdown notes, code (.ts, .py, .rs, .sql), or assignment screenshots.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Auto-chunked, embedded via Gemini, stored in Supabase pgvector
          </span>
        </div>
      </div>

      {/* Ingested Memories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Layers className="size-4 text-cyan-400" />
            <span>Retrieved Vector Snippets</span>
          </h2>
          <div className="flex items-center gap-1.5">
            {["all", "code", "note", "summary"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg uppercase font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-foreground/50 hover:text-foreground hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((memory) => (
            <InteractiveHoverCard
              key={memory.id}
              glowColor="rgba(6, 182, 212, 0.25)"
              className="p-5 rounded-2xl border border-vault-border bg-vault-card/85 space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {memory.category === "code" ? (
                    <FileCode className="size-4 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <FileText className="size-4 text-indigo-400 flex-shrink-0" />
                  )}
                  <h3 className="text-xs font-bold text-foreground line-clamp-1">{memory.title}</h3>
                </div>

                {/* Similarity Badge */}
                {memory.similarity && (
                  <span className="flex-shrink-0 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    {memory.similarity}% Match
                  </span>
                )}
              </div>

              {/* Rationale */}
              {memory.relevanceRationale && (
                <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-2 text-[11px] text-cyan-200">
                  <span className="font-semibold">Match Rationale:</span> {memory.relevanceRationale}
                </div>
              )}

              {/* Code / Content Preview */}
              <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-foreground/80 overflow-x-auto max-h-36 border border-vault-border leading-relaxed">
                <pre>{memory.content}</pre>
              </div>

              {/* Tags & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((t, idx) => (
                    <span key={idx} className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-foreground/60">
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-foreground/40">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
              </div>
            </InteractiveHoverCard>
          ))}
        </div>
      </div>
    </div>
  );
};
