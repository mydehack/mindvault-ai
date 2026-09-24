import { NextRequest, NextResponse } from 'next/server';
import { generateVideoSummaryAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { videoTitle, duration } = await req.json();
    const summary = await generateVideoSummaryAI(videoTitle || 'Completed Lecture', duration || '45 min');
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('API /api/video/auto-summary error:', error);
    return NextResponse.json({ error: error.message || 'Failed to auto-generate summary' }, { status: 500 });
  }
}
