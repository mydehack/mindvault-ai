export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string;
  learningStyle: string;
  currentStreak: number;
  totalXp: number;
  hoursStudied: number;
  themePreference: ThemeMode;
  createdAt: string;
}

export interface MilestoneActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  goalId: string;
  dayNumber: number;
  title: string;
  description: string;
  timeEstimate: string;
  youtubeVideoId: string;
  youtubeVideoTitle: string;
  youtubeVideoUrl: string;
  isCompleted: boolean;
  isVideoWatched: boolean;
  actionItems: MilestoneActionItem[];
  mentalModels: string[];
}

export interface Goal {
  id: string;
  profileId: string;
  title: string;
  domain: string;
  targetDuration: string;
  difficultyLevel: string;
  learningStyle: string;
  progressPercentage: number;
  isCompleted: boolean;
  bestVideoTitle: string;
  bestVideoUrl: string;
  bestVideoThumbnail: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface StorageFile {
  id: string;
  filename: string;
  fileType: string;
  category: 'summary' | 'roadmap' | 'certificate' | 'note' | 'code';
  tags: string[];
  content: string;
  sizeFormatted: string;
  createdAt: string;
}

export interface DailyQuest {
  id: string;
  questName: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  category: string;
}

export interface VaultMemory {
  id: string;
  title: string;
  category: 'note' | 'code' | 'pdf' | 'summary' | 'bookmark' | 'quest';
  content: string;
  summary: string;
  tags: string[];
  similarity?: number;
  relevanceRationale?: string;
  sourceUrl?: string;
  createdAt: string;
}

export type PersonaType = 'socratic' | 'architect' | 'tutor' | 'drillmaster';

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  tagline: string;
  avatar: string;
  systemPrompt: string;
  badge: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  persona: PersonaType;
  timestamp: string;
  hasAudio?: boolean;
  audioVoice?: string;
  diagramSvg?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domainConcept: string;
}

export interface QuizAssessment {
  id: string;
  title: string;
  type: 'rapid' | 'comprehensive';
  domain: string;
  questions: QuizQuestion[];
}

export interface CourseRecommendation {
  id: string;
  title: string;
  domain: string;
  description: string;
  estimatedWeeks: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  skillsGained: string[];
  curatedVideoUrl: string;
}
