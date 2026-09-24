import { NextRequest, NextResponse } from 'next/server';
import { generateMentorResponseAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { persona, userMessage, conversationHistory } = await req.json();
    const reply = await generateMentorResponseAI(persona || 'socratic', userMessage || 'Hello', conversationHistory || []);
    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('API /api/mentor/chat error:', error);
    return NextResponse.json({ error: error.message || 'Mentor chat failed' }, { status: 500 });
  }
}
