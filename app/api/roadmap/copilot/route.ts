import { NextRequest, NextResponse } from 'next/server';
import { evaluateRoadmapCopilotAI } from '@/lib/gemini';
import { Goal } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { goal, userMessage, chatHistory } = await req.json();

    if (!goal || !goal.milestones) {
      return NextResponse.json(
        { error: 'Valid goal object with milestones is required' },
        { status: 400 }
      );
    }

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'userMessage is required' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateRoadmapCopilotAI(
      goal as Goal,
      userMessage,
      chatHistory || []
    );

    return NextResponse.json({
      success: true,
      ...evaluation
    });
  } catch (error: any) {
    console.error('API /api/roadmap/copilot error:', error);
    return NextResponse.json(
      { error: error.message || 'Roadmap copilot evaluation failed' },
      { status: 500 }
    );
  }
}
