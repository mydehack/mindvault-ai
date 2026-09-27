import { NextRequest, NextResponse } from 'next/server';
import { searchStorageWithAI, askFileAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { query, files, askFile, fileName, fileContent, question } = await req.json();

    // Specific file Q&A
    if (askFile && fileName && fileContent && question) {
      const answer = await askFileAI(fileName, fileContent, question);
      return NextResponse.json({ success: true, answer });
    }

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchResult = await searchStorageWithAI(query, files || []);
    return NextResponse.json({ success: true, ...searchResult });
  } catch (error: any) {
    console.error('API /api/vault/search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search storage vault with AI' },
      { status: 500 }
    );
  }
}
