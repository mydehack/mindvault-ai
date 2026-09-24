import { NextRequest, NextResponse } from 'next/server';
import { generatePostGoalQuiz } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { domain, goalTitle, type } = await req.json();
    const quiz = await generatePostGoalQuiz(domain || 'Engineering', goalTitle || 'Systems Mastery', type || 'rapid');
    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    console.error('API /api/goals/quiz error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate assessment' }, { status: 500 });
  }
}
