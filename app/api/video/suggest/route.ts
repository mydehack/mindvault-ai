import { NextRequest, NextResponse } from 'next/server';
import { suggestVideosAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { skill, level } = await req.json();
    if (!skill || typeof skill !== 'string') {
      return NextResponse.json({ error: 'skill is required' }, { status: 400 });
    }

    const suggestions = await suggestVideosAI(skill.trim(), level || 'Intermediate');
    return NextResponse.json({ success: true, skill, suggestions });
  } catch (error: any) {
    console.error('API /api/video/suggest error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI video suggestions' },
      { status: 500 }
    );
  }
}
