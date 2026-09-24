-- ========================================================
-- MindVault AI — Supabase PostgreSQL Schema with pgvector
-- Production-Ready Vector Memory, Goals, Milestones & Quests
-- ========================================================

-- Enable vector extension for semantic vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL DEFAULT 'Explorer',
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Full-Stack AI Architect',
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=MindVault',
    learning_style TEXT DEFAULT 'Socratic Deep-Dive',
    current_streak INT DEFAULT 7,
    total_xp INT DEFAULT 1850,
    hours_studied NUMERIC(6, 1) DEFAULT 42.5,
    theme_preference TEXT DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    domain TEXT NOT NULL DEFAULT 'Computer Science',
    target_duration TEXT NOT NULL DEFAULT '30 days',
    difficulty_level TEXT DEFAULT 'Intermediate',
    learning_style TEXT DEFAULT 'Hands-on Projects',
    progress_percentage INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    best_video_title TEXT,
    best_video_url TEXT,
    best_video_thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    time_estimate TEXT DEFAULT '2 hours',
    youtube_video_id TEXT,
    youtube_video_title TEXT,
    youtube_video_url TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    is_video_watched BOOLEAN DEFAULT FALSE,
    action_items JSONB DEFAULT '[]'::jsonb,
    mental_models JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Memory Vault (Vector Semantic Search)
CREATE TABLE IF NOT EXISTS public.memory_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('note', 'code', 'pdf', 'summary', 'bookmark', 'quest')),
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    file_type TEXT DEFAULT 'markdown',
    file_size_bytes BIGINT DEFAULT 0,
    source_url TEXT,
    -- Gemini 768-dimensional or 1536-dimensional embeddings
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vector Index for Fast Cosine Similarity
CREATE INDEX IF NOT EXISTS memory_vault_embedding_idx 
ON public.memory_vault 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Match Memories Cosine Similarity RPC Function
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  content text,
  summary text,
  tags text[],
  source_url text,
  similarity float,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mv.id,
    mv.title,
    mv.category,
    mv.content,
    mv.summary,
    mv.tags,
    mv.source_url,
    1 - (mv.embedding <=> query_embedding) AS similarity,
    mv.created_at
  FROM public.memory_vault mv
  WHERE 1 - (mv.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR mv.category = filter_category)
  ORDER BY mv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Daily Quests Table
CREATE TABLE IF NOT EXISTS public.daily_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quest_name TEXT NOT NULL,
    description TEXT,
    xp_reward INT DEFAULT 50,
    is_completed BOOLEAN DEFAULT FALSE,
    quest_type TEXT DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (profile_id, quest_date, quest_name)
);

-- 6. Storage Files Table (for User Storage Vault)
CREATE TABLE IF NOT EXISTS public.storage_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'summary',
    tags TEXT[] DEFAULT '{}',
    content TEXT NOT NULL,
    size_formatted TEXT DEFAULT '2.4 KB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row-Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo and authenticated sessions
CREATE POLICY "Allow authenticated profile access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow authenticated goals access" ON public.goals FOR ALL USING (true);
CREATE POLICY "Allow authenticated milestones access" ON public.milestones FOR ALL USING (true);
CREATE POLICY "Allow authenticated memory_vault access" ON public.memory_vault FOR ALL USING (true);
CREATE POLICY "Allow authenticated daily_quests access" ON public.daily_quests FOR ALL USING (true);
CREATE POLICY "Allow authenticated storage_files access" ON public.storage_files FOR ALL USING (true);
