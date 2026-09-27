"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { ThemeMode } from "@/lib/types";

interface DayNightToggleProps {
  className?: string;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  showLabel?: boolean;
}

export const DayNightToggle: React.FC<DayNightToggleProps> = ({
  className = "",
  theme,
  onThemeChange,
  showLabel = true
}) => {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("progress_theme") || localStorage.getItem("mindvault_theme")) as ThemeMode | null;
    const initial = theme || saved || "dark";
    const darkActive = initial === "dark";
    setIsDark(darkActive);
    if (darkActive) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  const handleToggle = () => {
    const nextDark = !isDark;
    const nextTheme: ThemeMode = nextDark ? "dark" : "light";
    setIsDark(nextDark);
    localStorage.setItem("progress_theme", nextTheme);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
  };

  if (!mounted) {
    return <div className="h-9 w-20 rounded-full bg-slate-800/50 animate-pulse" />;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
        isDark
          ? "border-slate-700/80 bg-slate-900/90 text-slate-200 hover:bg-slate-800 shadow-indigo-500/10"
          : "border-slate-300 bg-white/95 text-slate-800 hover:bg-slate-50 shadow-amber-500/10"
      } ${className}`}
      title={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
      aria-label="Toggle Day and Dark mode"
    >
      {/* Icon with smooth flip rotation */}
      <motion.div
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="size-4 text-cyan-400 fill-cyan-400/20" />
        ) : (
          <Sun className="size-4 text-amber-500 fill-amber-500/20" />
        )}
      </motion.div>

      {/* Text label */}
      {showLabel && (
        <span className="text-[11px] font-medium tracking-tight">
          {isDark ? "Night" : "Day"}
        </span>
      )}

      {/* Mini status indicator dot */}
      <span
        className={`size-2 rounded-full transition-colors ${
          isDark ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
        }`}
      />
    </button>
  );
};
