import { NextRequest, NextResponse } from 'next/server';
import { generateDomainCourseRecommendations } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { domain, completedGoalTitle } = await req.json();
    const recommendations = await generateDomainCourseRecommendations(domain || 'Engineering', completedGoalTitle || 'Systems Mastery');
    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    console.error('API /api/goals/recommend error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate recommendations' }, { status: 500 });
  }
}
