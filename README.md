# 🧠 MindVault AI — Full-Stack Learning & Knowledge OS

> **Production-ready, full-stack, visually stunning learning ecosystem combining an AI Goal-to-Action Planner, an AI Digital Memory Vault, an Adaptive AI Mentor, and Real-Time Progress Tracking.**

---

## 🌟 Key Modules & Capabilities

### 1. 🎯 AI Goal-to-Action Planner (Gemini 3.8 Flash)
- **Time-Bound Roadmap Generator**: Turns natural language goals (e.g., *"Master Rust and Async Programming in 30 days"*) into 5 sequential milestone stages with time estimates, mental model tags, and concrete action task checklists.
- **Curated Public YouTube Masterclasses**: Verified YouTube course resolver that automatically identifies and links top-tier tutorials (freeCodeCamp, MIT, Andrej Karpathy, Fireship, Primeagen) for any engineering domain.
- **Interactive Checklists**: Real-time completion percentages and celebratory confetti bursts on completing milestones and roadmap targets.

### 2. 🧠 Digital Memory Vault ("Finds What You Forget")
- **Vector Semantic Search**: Chunked and embedded via Google Gemini (`gemini-embedding-2`), stored with Supabase `pgvector`.
- **Natural Language Retrieval**: Query using conversational prompts like *"Show me that Python code I wrote when I was learning loops"*.
- **Relevance & Match Rationale**: Computes cosine similarity percentage and explains why each snippet answers the query.
- **Multi-Source Drag-and-Drop Ingestion**: Supports `.md` notes, `.pdf` docs, and code files (`.ts`, `.py`, `.rs`, `.sql`).

### 3. 🤖 Adaptive AI Mentor & Multimedia Hub
- **Dynamic Coaching Personas**:
  - 🏛️ **Socratic Mentor**: Guides via first principles and deduction without revealing answers upfront.
  - 🏗️ **Senior Staff Architect**: Evaluates production trade-offs, p99 latency percentiles, and failure modes.
  - 🌱 **Friendly Tutor**: Intuitive analogies and step-by-step clarity.
  - 🎯 **Exam Drillmaster**: Timed interview traps and rigorous pop quizzes.
- **Audio TTS Narration**: Integrated Gemini 3.1 Flash TTS text-to-speech narration with speech synthesis audio player.
- **Visual Architecture Diagrams**: Gemini Omni 1.1 Flash distributed runtime diagrams and visual study aids inline.

### 4. 🎥 Lecture & Video Lab + AI Note Generating Bar
- **Video Progress Tracking**: In-app video player linked directly to milestone completion.
- **Auto-Tick Checkbox & Auto-Summary**: Marking a video as completed automatically ticks the milestone task, updates progress, awards +100 XP, and auto-generates a high-yield markdown summary saved directly to user storage.
- **Embedded AI Note Generating Bar**: 1-click presets:
  - 💡 *Key Takeaways & Mental Models*
  - 💻 *Code & Syntax Snippets*
  - 🗂️ *Active Recall Flashcards*
  - 📋 *Executive Summary*
  - 1-click "Save to Personal Storage Vault"

### 5. 🎓 Post-Goal Assessment & Course Recommendations
- **Goal Completion Assessment**: Upon reaching 100% (or via on-demand button), prompts user to take a:
  - ⚡ *5-Question Rapid Concept Quiz*, or
  - 🎓 *10-Question Comprehensive Engineering Exam*
- **Instant Explanations**: Gemini 3.8 Flash evaluates answers, explains trade-offs, and calculates final mastery score.
- **Domain Advancement**: Recommends 3 advanced engineering follow-up courses with 1-click *"Enroll & Generate Roadmap"*.

### 6. 📁 Personal Storage Vault & File Search
- **Dedicated Access Storage Modal**: Accessible via TopBar and Sidebar with active file counter.
- **Instant Search & Filtering**: Filter by All, Summaries, Roadmaps, Notes, Code, Certificates.
- **Markdown Document Preview & Export**: In-app viewer with 1-click copy and markdown download.

### 7. 📅 Interactive Calendar & Daily Quests
- **Interactive Calendar Modal**: Month navigation, streak indicators, today jumper.
- **5 Daily Learning Quests**:
  1. 🎬 Watch Curated Video Lecture (+100 XP)
  2. ⚡ Complete Milestone Action Checkbox (+50 XP)
  3. 💬 Socratic Dialogue with AI Mentor (+50 XP)
  4. 💾 Ingest or Search Memory Vault (+50 XP)
  5. 🧠 Active Recall Flashcard Review (+50 XP)

### 8. 📊 Analytics & Mastery Dashboard (Recharts)
- **Weekly Study Tracking**: Bar chart comparing planned vs. actual study hours.
- **Knowledge Vault Composition**: Donut chart breakdown of notes, code, summaries, and roadmaps.
- **Skill Mastery Radar**: 6-axis proficiency assessment across systems, algorithms, caching, and AI engineering.
- **30-Day Activity Heatmap**: Daily consistency tracking and unlockable engineering badges.

---

## 🚀 Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router), TypeScript |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Skiper UI (4, 58, 64) |
| **Analytics** | Recharts (Bar, Radar, Pie/Donut) |
| **AI Engine** | Google Gemini 3.8 Flash, Gemini Omni 1.1 Flash, Gemini 3.1 Flash TTS |
| **Vector DB** | Supabase (PostgreSQL with `pgvector` & `match_memories` RPC) |
| **Local Resilience** | LocalStorage state backup & offline-first zero-setup fallback |

---

## 🛠️ Quick Start & Running Locally

1. **Navigate to project directory**:
   \`\`\`bash
   cd mindvault-ai
   \`\`\`

2. **Environment Variables** (`.env.local`):
   \`\`\`env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=https://kwhgpmkpqqnbhqupaskw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   \`\`\`

3. **Start Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (`supabase_schema.sql`)
Run the provided `supabase_schema.sql` in your Supabase SQL editor to enable `pgvector`, table schema, RLS policies, and cosine distance matching function.
