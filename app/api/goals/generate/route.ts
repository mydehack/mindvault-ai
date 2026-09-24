import { NextRequest, NextResponse } from 'next/server';
import { generateRoadmapAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { goalTitle, targetDuration, difficultyLevel, learningStyle } = await req.json();
    if (!goalTitle) {
      return NextResponse.json({ error: 'goalTitle is required' }, { status: 400 });
    }

    const goal = await generateRoadmapAI(
      goalTitle,
      targetDuration || '30 days',
      difficultyLevel || 'Intermediate',
      learningStyle || 'Socratic Deep-Dive'
    );

    return NextResponse.json({ success: true, goal });
  } catch (error: any) {
    console.error('API /api/goals/generate error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate goal roadmap' }, { status: 500 });
  }
}
