"use client";

import React, { useEffect, useState } from "react";
import { ThemeToggleButton3 } from "./skiper-ui/skiper4";
import { ThemeMode } from "@/lib/types";

interface DayNightToggleProps {
  className?: string;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const DayNightToggle: React.FC<DayNightToggleProps> = ({
  className = "",
  theme,
  onThemeChange
}) => {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mindvault_theme") as ThemeMode | null;
    const initial = theme || saved || "dark";
    const darkActive = initial === "dark";
    setIsDark(darkActive);
    if (darkActive) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleToggle = () => {
    const nextDark = !isDark;
    const nextTheme: ThemeMode = nextDark ? "dark" : "light";
    setIsDark(nextDark);
    localStorage.setItem("mindvault_theme", nextTheme);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
  };

  if (!mounted) {
    return <div className="size-10 rounded-full bg-slate-800 animate-pulse" />;
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <ThemeToggleButton3 isDark={isDark} onToggle={handleToggle} />
    </div>
  );
};
