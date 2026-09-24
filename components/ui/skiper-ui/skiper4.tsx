"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const ThemeToggleButton1 = ({
  className = "",
  isDark = true,
  onToggle
}: {
  className?: string;
  isDark?: boolean;
  onToggle?: () => void;
}) => {
  const [internalDark, setInternalDark] = useState(isDark);
  const dark = onToggle ? isDark : internalDark;

  const handleClick = () => {
    if (onToggle) onToggle();
    else setInternalDark(!internalDark);
  };

  return (
    <button
      type="button"
      className={cn(
        "rounded-full bg-vault-card border border-vault-border text-foreground transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center",
        className
      )}
      onClick={handleClick}
      aria-label="Toggle Theme"
    >
      <svg viewBox="0 0 240 240" fill="none" className="size-6" xmlns="http://www.w3.org/2000/svg">
        <motion.g
          animate={{ rotate: dark ? -180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.35 }}
        >
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            fill="currentColor"
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            fill={dark ? "#6366f1" : "#f59e0b"}
          />
        </motion.g>
        <motion.path
          animate={{ rotate: dark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.35 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export const ThemeToggleButton3 = ({
  className = "",
  isDark = true,
  onToggle
}: {
  className?: string;
  isDark?: boolean;
  onToggle?: () => void;
}) => {
  const [internalDark, setInternalDark] = useState(isDark);
  const dark = onToggle ? isDark : internalDark;

  const handleClick = () => {
    if (onToggle) onToggle();
    else setInternalDark(!internalDark);
  };

  return (
    <button
      type="button"
      className={cn(
        "rounded-full transition-all duration-300 active:scale-95 border border-white/10 p-2 shadow-lg flex items-center justify-center",
        dark ? "bg-slate-900/90 text-amber-400 hover:text-amber-300" : "bg-white/90 text-indigo-600 hover:text-indigo-500",
        className
      )}
      onClick={handleClick}
      aria-label="Toggle Day and Night mode"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="size-5"
      >
        <clipPath id="skiper-btn-3">
          <motion.path
            animate={{ y: dark ? 14 : 0, x: dark ? -11 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-11h25a1 1 0 0017 13v30H0Z"
          />
        </clipPath>
        <g clipPath="url(#skiper-btn-3)">
          <motion.circle
            animate={{ r: dark ? 10 : 8 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              scale: dark ? 0.5 : 1,
              opacity: dark ? 0 : 1,
            }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
};
