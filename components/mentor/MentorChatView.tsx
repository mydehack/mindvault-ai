"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  Volume2,
  Sparkles,
  Layers,
  Cpu,
  HelpCircle,
  ShieldAlert,
  Flame,
  User,
  VolumeX,
  PlayCircle
} from "lucide-react";
import { PersonaType, PersonaConfig, ChatMessage } from "@/lib/types";
import { generateMentorResponseAI } from "@/lib/gemini";

const PERSONAS: PersonaConfig[] = [
  {
    id: "socratic",
    name: "Socratic Mentor",
    tagline: "First-principles deduction & guided discovery",
    avatar: "🏛️",
    badge: "First Principles",
    color: "from-indigo-500 to-cyan-500",
    systemPrompt: "Guide the user through deep first principles questions."
  },
  {
    id: "architect",
    name: "Senior Staff Architect",
    tagline: "High-scale trade-offs, p99 latency & failure modes",
    avatar: "🏗️",
    badge: "Google L7 / Meta E7",
    color: "from-amber-500 to-rose-500",
    systemPrompt: "Evaluate production tradeoffs and system boundaries."
  },
  {
    id: "tutor",
    name: "Friendly Tutor",
    tagline: "Intuitive analogies & step-by-step clarity",
    avatar: "🌱",
    badge: "Clear Analogies",
    color: "from-emerald-500 to-teal-500",
    systemPrompt: "Explain with clear relatable metaphors."
  },
  {
    id: "drillmaster",
    name: "Exam Drillmaster",
    tagline: "Timed interview traps & rigorous pop quizzes",
    avatar: "🎯",
    badge: "Interview Drill",
    color: "from-purple-500 to-pink-500",
    systemPrompt: "Drill the user with rapid-fire technical challenges."
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    role: "model",
    persona: "socratic",
    content: "Greetings, engineer. I am your Socratic Mentor. When you study a complex system, where do you begin: with the high-level API abstraction, or the underlying memory & kernel boundary? What concept are we deducing today?",
    timestamp: "Just now"
  }
];

export const MentorChatView: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("socratic");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showDiagram, setShowDiagram] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePersonaConfig = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const newMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      persona: selectedPersona,
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await generateMentorResponseAI(selectedPersona, userText, history);

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "model",
        persona: selectedPersona,
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Audio Narration (Gemini Flash TTS playback via Web Speech API fallback)
  const handleToggleSpeak = (msg: ChatMessage) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMsgId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.content.replace(/[*#`_]/g, ""));
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Top Personas Switcher */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-indigo-400" />
            <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Dynamic Coaching Personas (Gemini 3.8 Flash)
            </h1>
          </div>
          <span className="text-[10px] text-foreground/50">Switch on the fly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-500/20"
                    : "border-vault-border bg-slate-900/40 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{persona.avatar}</span>
                  <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold text-foreground/70">
                    {persona.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-foreground">{persona.name}</div>
                <div className="text-[10px] text-foreground/60 mt-0.5 line-clamp-1">{persona.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="rounded-3xl border border-vault-border bg-vault-card/90 backdrop-blur-xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-vault-border flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-lg shadow-md">
              {activePersonaConfig.avatar}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>{activePersonaConfig.name}</span>
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-foreground/50">{activePersonaConfig.tagline}</div>
            </div>
          </div>

          {/* Multimedia Visual Aids Toggle (Gemini Omni 1.1) */}
          <button
            onClick={() => setShowDiagram(!showDiagram)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              showDiagram
                ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                : "border-vault-border bg-slate-800/50 text-foreground/70 hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Architecture Diagram (Omni 1.1)</span>
          </button>
        </div>

        {/* Inline Architecture Diagram (Omni 1.1 Feature) */}
        {showDiagram && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-vault-border bg-slate-950/80"
          >
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Cpu className="size-4" />
                  <span>Gemini Omni 1.1 Flash — Distributed Runtime Architecture</span>
                </span>
                <span className="text-[10px] text-foreground/50">24kHz PCM Audio & Vector Ready</span>
              </div>
              <div className="font-mono text-[11px] text-cyan-200/90 whitespace-pre p-2 bg-slate-900/80 rounded-xl overflow-x-auto">
{`+------------------------+      gRPC / HTTP/2     +----------------------------+
|  Client Ingestion Layer | ---------------------> | Async Event Loop (Tokio)   |
+------------------------+                        +----------------------------+
            |                                                    |
            v (Raw payload)                                      v
+------------------------+                         +----------------------------+
| Gemini 3.8 Vector RAG  |                         | Redis LRU (Single-Flight)  |
+------------------------+                         +----------------------------+
            |                                                    |
            v (Embedding: 768)                                   v (PostgreSQL)
+-------------------------------------------------------------------------------+
|  Supabase pgvector (match_memories RPC) & Memory Vault Storage                |
+-------------------------------------------------------------------------------+`}
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isModel = msg.role === "model";
            const isSpeaking = speakingMsgId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isModel ? "justify-start" : "justify-end"}`}
              >
                {isModel && (
                  <div className="flex items-center justify-center size-8 rounded-xl bg-slate-800 text-sm flex-shrink-0 mt-1">
                    {activePersonaConfig.avatar}
                  </div>
                )}

                <div
                  className={`relative max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isModel
                      ? "border border-vault-border bg-slate-900/80 text-foreground/95"
                      : "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Narration audio control for Model messages */}
                  {isModel && (
                    <div className="mt-3 pt-2 border-t border-vault-border/50 flex items-center justify-between text-[11px] text-foreground/50">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleToggleSpeak(msg)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                          isSpeaking
                            ? "border-amber-400 bg-amber-400/20 text-amber-300 font-bold"
                            : "border-vault-border bg-slate-800/40 text-foreground/60 hover:text-foreground"
                        }`}
                        title="Gemini 3.1 Flash TTS Narration Playback"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="size-3 text-amber-400" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="size-3" />
                            <span>TTS Narration</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isModel && (
                  <div className="flex items-center justify-center size-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex-shrink-0 mt-1">
                    <User className="size-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-xl bg-slate-800 text-sm">
                {activePersonaConfig.avatar}
              </div>
              <div className="rounded-2xl border border-vault-border bg-slate-900/60 p-3.5 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-foreground/50 ml-2">Reasoning via Gemini 3.8 Flash...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-vault-border bg-slate-900/70 flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask your ${activePersonaConfig.name} anything about architecture, code, or invariants...`}
            className="flex-1 rounded-2xl border border-vault-border bg-slate-900/80 px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            disabled={isTyping || !inputMessage.trim()}
            className="flex items-center justify-center size-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
