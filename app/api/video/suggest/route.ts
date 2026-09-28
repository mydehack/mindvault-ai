import { NextRequest, NextResponse } from 'next/server';
import { recommendVideos, extractLearningIntent } from '@/lib/recommendation-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query,
      skill,
      topic,
      level,
      goal,
      language = 'English',
      contentType = 'course',
      userId = 'guest',
      count = 4,
      bypassHistory = false
    } = body;

    const rawSearch = (query || skill || '').trim();
    if (!rawSearch) {
      return NextResponse.json({ error: 'skill or query is required' }, { status: 400 });
    }

    // Backend independent validation & intent extraction
    const intent = await extractLearningIntent(
      rawSearch,
      level,
      goal,
      language
    );

    // If explicit topic/contentType were passed, respect them
    if (topic) intent.topic = topic.trim();
    if (contentType) intent.contentType = contentType;

    const result = await recommendVideos({
      skill: intent.skill,
      topic: intent.topic,
      level: intent.level,
      goal: intent.goal,
      language: intent.language,
      contentType: intent.contentType,
      userId,
      count: Math.min(Math.max(Number(count) || 4, 1), 8),
      bypassHistory: Boolean(bypassHistory)
    });

    return NextResponse.json({
      success: true,
      intent: result.intent,
      searchQueries: result.searchQueries,
      totalCandidatesEvaluated: result.totalCandidatesEvaluated,
      suggestions: result.videos,
      fromCache: result.fromCache || false
    });
  } catch (error: any) {
    console.error('API /api/video/suggest error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI video recommendations' },
      { status: 500 }
    );
  }
}
