export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string;
  learningStyle: string;
  dailyCommitment?: string;
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
  dailyCommitment?: string;
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
  matchScore?: number;
  rationale?: string;
  keySnippet?: string;
}

export interface StorageFileMatch {
  id: string;
  matchScore: number;
  rationale: string;
  keySnippet: string;
}

export interface AISearchResult {
  aiSynthesis: string;
  rankedFiles: StorageFileMatch[];
  suggestedQueries: string[];
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

export interface VideoSuggestion {
  id: string;
  title: string;
  channel: string;
  duration: string;
  url: string;
  videoId: string;
  thumbnailUrl: string;
  category: 'Foundation' | 'Deep Dive' | 'Hands-on Project' | 'Production Masterclass' | 'Crash Course';
  whyRecommended: string;
  keyTopics: string[];
}

export interface RoadmapVideoReplacement {
  milestoneId: string;
  milestoneTitle: string;
  oldVideoTitle: string;
  newVideoTitle: string;
  newVideoChannel: string;
  newVideoDuration: string;
  newVideoUrl: string;
  newVideoId: string;
  newVideoThumbnail: string;
  reasoning: string;
}

export interface RoadmapCopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  videoReplacement?: RoadmapVideoReplacement;
  isIssueSignificant?: boolean;
}

// ==============================================================================
// Dynamic AI Course & Video Recommendation System Types
// ==============================================================================

export type LearningMode = 'course' | 'video' | 'project';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningIntent {
  skill: string;
  domain: string;
  topic?: string;
  level: SkillLevel;
  goal: string;
  language: string;
  contentType: LearningMode;
  rawQuery?: string;
}

export interface CandidateVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  skill: string;
  topic?: string;
  level: SkillLevel;
  language: string;
  category: 'Foundation' | 'Deep Dive' | 'Hands-on Project' | 'Production Masterclass' | 'Crash Course';
  relevanceScore: number;
  whyRecommended: string;
  recommendationReason: string;
  source: 'youtube_search' | 'approved_external_source' | 'user_saved' | 'hardcoded';
  normalizedUrl?: string;
  keyTopics: string[];
}

export interface RecommendationHistoryItem {
  id: string;
  userId: string;
  videoId: string;
  videoUrl: string;
  title: string;
  channel?: string;
  skill: string;
  topic?: string;
  level: string;
  goal?: string;
  language?: string;
  contentType?: string;
  matchScore?: number;
  recommendedAt: string;
  watched: boolean;
  completed: boolean;
  progress: number;
}

export interface RecommendationDebugInfo {
  requestedSkill: string;
  searchQuery: string;
  candidatesFound: number;
  rejected: {
    wrongSkill: number;
    duplicate: number;
    previouslyRecommended: number;
    wrongLevel: number;
    hardcodedSource: number;
  };
  accepted: number;
}

export interface RecommendationResult {
  intent: LearningIntent;
  searchQueries: string[];
  totalCandidatesEvaluated: number;
  videos: CandidateVideo[];
  fromCache?: boolean;
  debug?: RecommendationDebugInfo;
}


