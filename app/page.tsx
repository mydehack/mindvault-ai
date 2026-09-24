"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, Goal, Milestone, StorageFile, DailyQuest, ThemeMode, CourseRecommendation } from "@/lib/types";
import { LoginView } from "@/components/auth/LoginView";
import { InitialGoalEntry } from "@/components/onboarding/InitialGoalEntry";
import { VerticalSidebar, NavView } from "@/components/navigation/VerticalSidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { GoalRoadmapView } from "@/components/dashboard/GoalRoadmapView";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { MemoryVaultView } from "@/components/vault/MemoryVaultView";
import { MentorChatView } from "@/components/mentor/MentorChatView";
import { VideoLabView } from "@/components/video/VideoLabView";
import { StorageModal } from "@/components/modals/StorageModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { VideoStudyModal } from "@/components/modals/VideoStudyModal";
import { PostGoalAssessmentModal } from "@/components/modals/PostGoalAssessmentModal";
import { generateRoadmapAI } from "@/lib/gemini";
import confetti from "canvas-confetti";

const INITIAL_QUESTS: DailyQuest[] = [
  { id: "q-1", questName: "Watch Curated Video Masterclass", description: "Complete today's milestone lecture video", xpReward: 100, isCompleted: false, category: "video" },
  { id: "q-2", questName: "Complete Milestone Task Checkbox", description: "Advance roadmap progression", xpReward: 50, isCompleted: false, category: "milestone" },
  { id: "q-3", questName: "Socratic Dialogue with AI Mentor", description: "Ask a first-principles question in Mentor Hub", xpReward: 50, isCompleted: false, category: "mentor" },
  { id: "q-4", questName: "Ingest or Search Memory Vault", description: "Query your pgvector store using natural language", xpReward: 50, isCompleted: false, category: "vault" },
  { id: "q-5", questName: "Active Recall Flashcard Review", description: "Test memory retention on mental models", xpReward: 50, isCompleted: false, category: "flashcard" },
];

const INITIAL_FILES: StorageFile[] = [
  {
    id: "f-1",
    filename: "Rust_Async_Tokio_Executive_Summary.md",
    fileType: "markdown",
    category: "summary",
    tags: ["Rust", "Tokio", "Concurrency"],
    sizeFormatted: "2.1 KB",
    createdAt: "2026-09-23T11:00:00Z",
    content: `# 🦀 Executive Summary: Rust Async Programming & Tokio\n\n## Overview\nRust delivers memory safety without garbage collection through compile-time borrow checking and ownership transfer semantics.\n\n## Mental Models\n- **Zero-Cost Futures**: In Rust, Futures are state machines that do nothing until polled.\n- **Cooperative Multitasking**: Tokio tasks must yield voluntarily at .await points.\n- **Work Stealing**: Tokio's multi-threaded scheduler balances task queues across CPU cores.\n\n\`\`\`rust\n#[tokio::main]\nasync fn main() {\n    println!("Tokio async runtime active!");\n}\n\`\`\`\n`
  },
  {
    id: "f-2",
    filename: "Distributed_Caching_Mitigation_Notes.md",
    fileType: "markdown",
    category: "note",
    tags: ["Redis", "Caching", "Distributed Systems"],
    sizeFormatted: "1.4 KB",
    createdAt: "2026-09-22T08:30:00Z",
    content: `# ⚡ Cache Stampede Mitigation: Single-Flight Mutex\n\nWhen a cache key with 10k QPS expires, naive architectures hammer PostgreSQL.\n\n**Remedy**:\n1. Mutex locking during cache rebuild\n2. XFetch probabilistic early invalidation\n3. Background TTL refresh via Redis pub/sub`
  }
];

export default function MindVaultApp() {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("dark");

  // User & Auth State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Goal & Curriculum State
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  // Navigation View State
  const [activeView, setActiveView] = useState<NavView>("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

  // Modals State
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [videoModalMilestone, setVideoModalMilestone] = useState<Milestone | null>(null);

  // Data Stores
  const [quests, setQuests] = useState<DailyQuest[]>(INITIAL_QUESTS);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>(INITIAL_FILES);

  // Load persisted session
  useEffect(() => {
    const savedUser = localStorage.getItem("mindvault_user");
    const savedGoal = localStorage.getItem("mindvault_goal");
    const savedTheme = (localStorage.getItem("mindvault_theme") as ThemeMode) || "dark";

    setCurrentTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (savedUser) {
      try {
        setUserProfile(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedGoal) {
      try {
        setCurrentGoal(JSON.parse(savedGoal));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("mindvault_user", JSON.stringify(profile));
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    localStorage.setItem("mindvault_theme", newTheme);
    if (userProfile) {
      const updated = { ...userProfile, themePreference: newTheme };
      setUserProfile(updated);
      localStorage.setItem("mindvault_user", JSON.stringify(updated));
    }
  };

  const handleCreateGoal = async (goalTitle: string, duration: string, level: string) => {
    try {
      const goal = await generateRoadmapAI(
        goalTitle,
        duration,
        level,
        userProfile?.learningStyle || "Socratic Deep-Dive"
      );
      setCurrentGoal(goal);
      localStorage.setItem("mindvault_goal", JSON.stringify(goal));
      setActiveView("dashboard");
    } catch (err) {
      console.error("Goal creation error:", err);
    }
  };

  const handleInstantCuratedLoad = async () => {
    await handleCreateGoal("Master Rust and Async Programming in 30 days", "30 days", "Intermediate");
  };

  const handleResetGoal = () => {
    setCurrentGoal(null);
    localStorage.removeItem("mindvault_goal");
  };

  // Milestone action checkbox toggle & progress calculation
  const handleToggleActionItem = (milestoneId: string, actionId: string) => {
    if (!currentGoal) return;

    let totalActions = 0;
    let completedActions = 0;

    const updatedMilestones = currentGoal.milestones.map((m) => {
      if (m.id === milestoneId) {
        const updatedItems = m.actionItems.map((act) => {
          if (act.id === actionId) {
            const nextVal = !act.completed;
            if (nextVal) {
              // Award XP
              if (userProfile) {
                const updatedUser = { ...userProfile, totalXp: userProfile.totalXp + 25 };
                setUserProfile(updatedUser);
                localStorage.setItem("mindvault_user", JSON.stringify(updatedUser));
              }
            }
            return { ...act, completed: nextVal };
          }
          return act;
        });

        const allDone = updatedItems.length > 0 && updatedItems.every((a) => a.completed);
        totalActions += updatedItems.length;
        completedActions += updatedItems.filter((a) => a.completed).length;

        return { ...m, actionItems: updatedItems, isCompleted: allDone };
      }

      totalActions += m.actionItems.length;
      completedActions += m.actionItems.filter((a) => a.completed).length;
      return m;
    });

    const progressPercentage = Math.round((completedActions / Math.max(1, totalActions)) * 100);
    const isCompleted = progressPercentage >= 100;

    const updatedGoal: Goal = {
      ...currentGoal,
      milestones: updatedMilestones,
      progressPercentage,
      isCompleted
    };

    setCurrentGoal(updatedGoal);
    localStorage.setItem("mindvault_goal", JSON.stringify(updatedGoal));

    if (isCompleted) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      setTimeout(() => setIsAssessmentOpen(true), 1200);
    }
  };

  // Video Completed: Auto-tick checkbox, advance progress, award +100 XP, auto-save summary to storage
  const handleCompleteVideo = (milestoneId: string, summaryFile: StorageFile) => {
    if (!currentGoal) return;

    // 1. Add summary to storage files
    setStorageFiles((prev) => [summaryFile, ...prev]);

    // 2. Award +100 XP
    if (userProfile) {
      const updatedUser = {
        ...userProfile,
        totalXp: userProfile.totalXp + 100,
        hoursStudied: parseFloat((userProfile.hoursStudied + 0.8).toFixed(1))
      };
      setUserProfile(updatedUser);
      localStorage.setItem("mindvault_user", JSON.stringify(updatedUser));
    }

    // 3. Auto-tick milestone tasks & mark video watched
    let totalActions = 0;
    let completedActions = 0;

    const updatedMilestones = currentGoal.milestones.map((m) => {
      if (m.id === milestoneId) {
        const autoCheckedItems = m.actionItems.map((act) => ({ ...act, completed: true }));
        totalActions += autoCheckedItems.length;
        completedActions += autoCheckedItems.length;
        return {
          ...m,
          isVideoWatched: true,
          isCompleted: true,
          actionItems: autoCheckedItems
        };
      }
      totalActions += m.actionItems.length;
      completedActions += m.actionItems.filter((a) => a.completed).length;
      return m;
    });

    const progressPercentage = Math.round((completedActions / Math.max(1, totalActions)) * 100);
    const isCompleted = progressPercentage >= 100;

    const updatedGoal: Goal = {
      ...currentGoal,
      milestones: updatedMilestones,
      progressPercentage,
      isCompleted
    };

    setCurrentGoal(updatedGoal);
    localStorage.setItem("mindvault_goal", JSON.stringify(updatedGoal));

    // Update active video study modal milestone
    const active = updatedMilestones.find((m) => m.id === milestoneId);
    if (active) setVideoModalMilestone(active);

    if (isCompleted) {
      setTimeout(() => setIsAssessmentOpen(true), 1200);
    }
  };

  const handleSaveNoteToStorage = (file: StorageFile) => {
    setStorageFiles((prev) => [file, ...prev]);
  };

  const handleToggleQuest = (questId: string) => {
    const updated = quests.map((q) => {
      if (q.id === questId) {
        const next = !q.isCompleted;
        if (next && userProfile) {
          const updatedUser = { ...userProfile, totalXp: userProfile.totalXp + q.xpReward };
          setUserProfile(updatedUser);
          localStorage.setItem("mindvault_user", JSON.stringify(updatedUser));
        }
        return { ...q, isCompleted: next };
      }
      return q;
    });
    setQuests(updated);
  };

  const handleEnrollNewCourse = async (course: CourseRecommendation) => {
    await handleCreateGoal(course.title, course.estimatedWeeks, course.difficulty);
  };

  const incompleteQuestsCount = quests.filter((q) => !q.isCompleted).length;

  // 1. GATE 1: Ask for Login first
  if (!userProfile) {
    return (
      <LoginView
        onLogin={handleLogin}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
    );
  }

  // 2. GATE 2: Distraction-free Goal Entry screen until user enters goal
  if (!currentGoal) {
    return (
      <InitialGoalEntry
        user={userProfile}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onSubmitGoal={handleCreateGoal}
        onInstantCuratedLoad={handleInstantCuratedLoad}
      />
    );
  }

  // 3. UNLOCKED FULL APP: VerticalSidebar, TopBar, and Modules
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Vertical Navigation Index (VerticalSidebar) */}
      <VerticalSidebar
        activeView={activeView}
        onSelectView={setActiveView}
        user={userProfile}
        storageCount={storageFiles.length}
        questCount={incompleteQuestsCount}
        onOpenStorage={() => setIsStorageOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNewGoal={handleResetGoal}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar with Storage Icon, Calendar Icon, Theme Toggle, Profile */}
        <TopBar
          user={userProfile}
          storageCount={storageFiles.length}
          questCount={incompleteQuestsCount}
          onOpenStorage={() => setIsStorageOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />

        {/* View Router */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {activeView === "dashboard" && (
            <GoalRoadmapView
              goal={currentGoal}
              onToggleActionItem={handleToggleActionItem}
              onOpenVideoStudy={(m) => setVideoModalMilestone(m)}
              onOpenAssessment={() => setIsAssessmentOpen(true)}
            />
          )}

          {activeView === "planner" && (
            <GoalRoadmapView
              goal={currentGoal}
              onToggleActionItem={handleToggleActionItem}
              onOpenVideoStudy={(m) => setVideoModalMilestone(m)}
              onOpenAssessment={() => setIsAssessmentOpen(true)}
            />
          )}

          {activeView === "vault" && <MemoryVaultView />}

          {activeView === "mentor" && <MentorChatView />}

          {activeView === "video" && (
            <VideoLabView onSaveToVault={handleSaveNoteToStorage} />
          )}

          {activeView === "analytics" && (
            <AnalyticsDashboard user={userProfile} />
          )}
        </main>
      </div>

      {/* Storage Vault Modal */}
      <StorageModal
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
        files={storageFiles}
      />

      {/* Interactive Calendar & Daily Quests Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        quests={quests}
        onToggleQuest={handleToggleQuest}
        user={userProfile}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={userProfile}
        onResetGoal={handleResetGoal}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Video Study Modal with In-App Player & AI Note Generating Bar */}
      {videoModalMilestone && (
        <VideoStudyModal
          isOpen={Boolean(videoModalMilestone)}
          onClose={() => setVideoModalMilestone(null)}
          milestone={videoModalMilestone}
          onCompleteVideo={handleCompleteVideo}
          onSaveNoteToStorage={handleSaveNoteToStorage}
        />
      )}

      {/* Post-Goal Assessment Modal (Quiz / Exam & Course Recommendations) */}
      <PostGoalAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        goal={currentGoal}
        onEnrollNewCourse={handleEnrollNewCourse}
      />
    </div>
  );
}
