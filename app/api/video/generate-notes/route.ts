import { NextRequest, NextResponse } from 'next/server';
import { generateVideoNotesAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { videoTitle, noteType, context } = await req.json();
    const notes = await generateVideoNotesAI(videoTitle || 'Lecture', noteType || 'takeaways', context);
    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error('API /api/video/generate-notes error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate video notes' }, { status: 500 });
  }
}
