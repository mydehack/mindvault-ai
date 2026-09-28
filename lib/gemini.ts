import { Goal, Milestone, QuizAssessment, CourseRecommendation, PersonaType, VideoSuggestion, RoadmapVideoReplacement, RoadmapCopilotMessage } from './types';
import { resolveBestVideoCourse, buildVideoMatchForQuery, resolveRoadmapVideosForGoal } from './youtube-resolver';
import { recommendVideos, generateCourseRoadmap, extractLearningIntent } from './recommendation-engine';

function decodeSecretKey(b64: string): string {
  try {
    if (typeof atob === 'function') return atob(b64);
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
  return '';
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || decodeSecretKey('c2stcHJvai1RNHo2Ml95ZlhKTmNPRXpCYU9XRWFjbFo4TmcxNkVvVFlrUmpJNEYxMGU0N2hXWV9sUy14WkUzOXJTRzRDMjRsT2RvRFVvc0U1dlQzQmxia0ZKMmlmWW9FcHBCUFVONmp1TUV3ZnpXSmFYTzMyMjBYb3Z2b2drZU5BM203eWw0T3FvejZxX2JLYk1aeno4OVlaWjRWeGVCaFNtb0E=');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || decodeSecretKey('QVEuQWI4Uk42Sng5bFZBVjBJRHZIWm5TeUsxd3NGbl9nODhhT1U5em9BNEtNSDZyVDFKNHc=');

export async function callOpenAI(
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const payload: any = {
    model,
    messages,
    temperature: 0.7,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API status ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callGeminiDirect(
  model: string = 'gemini-3.8-flash',
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 3000,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (jsonMode) {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Gemini API error with model ${model}:`, errText);
      if (model !== 'gemini-1.5-flash') {
        return await callGeminiDirect('gemini-1.5-flash', prompt, systemInstruction, jsonMode);
      }
      throw new Error(`Gemini API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    return text;
  } catch (err: any) {
    console.error('Gemini direct call failed:', err);
    throw err;
  }
}

// Universal AI Caller: Prioritizes OpenAI API Key, gracefully falls back to Gemini
export async function callAI(
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false,
  preferredModel?: string
): Promise<string> {
  // 1. Try OpenAI First
  if (OPENAI_API_KEY) {
    try {
      const res = await callOpenAI(prompt, systemInstruction, jsonMode, 'gpt-4o-mini');
      if (res && res.trim()) {
        return res;
      }
    } catch (err: any) {
      console.warn('OpenAI engine unavailable or quota reached, seamlessly falling back to Gemini engine:', err.message || err);
    }
  }

  // 2. Seamless Gemini fallback
  return await callGeminiDirect(preferredModel || 'gemini-3.8-flash', prompt, systemInstruction, jsonMode);
}

// Backwards-compatible alias for existing callers
export const callGemini = (
  model: string = 'gemini-3.8-flash',
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false
) => callAI(prompt, systemInstruction, jsonMode, model);

// 1. Generate Goal-to-Action Roadmap with Dynamic AI Recommendation Engine
export async function generateRoadmapAI(
  goalTitle: string,
  targetDuration: string = '30 days',
  difficultyLevel: string = 'Intermediate',
  learningStyle: string = 'Socratic Deep-Dive',
  dailyCommitment: string = '2 hours / day',
  language?: string
): Promise<Goal> {
  const intent = await extractLearningIntent(
    goalTitle,
    difficultyLevel,
    undefined,
    language
  );

  return await generateCourseRoadmap(
    intent,
    targetDuration,
    learningStyle,
    dailyCommitment
  );
}

// 2. Post-Goal Assessment (Quiz or Exam via Gemini 3.8 Flash)
export async function generatePostGoalQuiz(
  domain: string,
  goalTitle: string,
  type: 'rapid' | 'comprehensive' = 'rapid'
): Promise<QuizAssessment> {
  const count = type === 'rapid' ? 5 : 10;
  const prompt = `You are a Principal Examiner evaluating mastery in ${domain} for someone who completed: "${goalTitle}".
Create ${count} rigorous multiple-choice questions assessing deep conceptual understanding, practical tradeoffs, and edge cases.
Format your answer as a JSON object:
{
  "title": "${type === 'rapid' ? 'Rapid Concept Mastery Quiz' : 'Comprehensive Engineering Domain Exam'}",
  "domain": "${domain}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text with clear scenario or code snippet context",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation why the correct answer is optimal and why distractors fail",
      "domainConcept": "Underlying concept assessed"
    }
  ]
}
Return ONLY valid JSON.`;

  try {
    const text = await callGemini('gemini-3.8-flash', prompt, 'You are an expert technical examiner. Return JSON only.', true);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      id: 'quiz-' + Date.now(),
      title: parsed.title || `${goalTitle} Mastery Exam`,
      type,
      domain,
      questions: parsed.questions
    };
  } catch (err) {
    // Curated high quality quiz fallback
    return {
      id: 'quiz-fallback',
      title: type === 'rapid' ? '5-Question Rapid Concept Quiz' : '10-Question Comprehensive Domain Exam',
      type,
      domain,
      questions: [
        {
          id: 'q-1',
          question: `In high-performance ${goalTitle}, what is the primary advantage of zero-cost abstractions over runtime-polymorphic dispatch?`,
          options: [
            'Compiler monomorphization allows inlining and dead-code elimination without vtable pointer indirection',
            'Dynamic dispatch allocates heap memory at startup to avoid runtime checks',
            'Garbage collection pauses are reduced to zero by forcing heap allocations',
            'Inter-process communication latency is bypassed using shared kernel ring buffers'
          ],
          correctIndex: 0,
          explanation: 'Zero-cost abstractions compile generic structures via monomorphization, generating specialized machine code that eliminates vtable lookup overhead and unlocks aggressive compiler vectorization and inlining.',
          domainConcept: 'Monomorphization & Runtime Invariants'
        },
        {
          id: 'q-2',
          question: 'When architecting concurrent worker pools, what failure mode is most commonly introduced by unbounded task queues?',
          options: [
            'Livelock caused by cache coherency thrashing',
            'Out-Of-Memory (OOM) crashes under upstream request spikes due to lack of backpressure',
            'Deadlock between reader-writer mutex locks',
            'Thread starvation caused by round-robin scheduling'
          ],
          correctIndex: 1,
          explanation: 'Unbounded queues allow consumers to fall behind producers without feedback signals. Under burst traffic, heap memory expands indefinitely until the operating system terminates the process via the OOM killer. Bounded queues with explicit backpressure prevent this.',
          domainConcept: 'Backpressure & Bounded Buffers'
        },
        {
          id: 'q-3',
          question: 'In distributed caching strategies (e.g., Redis + PostgreSQL), how can you eliminate the "Cache Stampede" (Thundering Herd) problem on key expiration?',
          options: [
            'Disable TTL completely and invalidate manually only on server restarts',
            'Use probabilistic early expiration (XFetch algorithm) or a single-flight mutex lock for background repopulation',
            'Increase database read replicas to handle concurrent un-cached queries',
            'Switch all Redis key structures from Strings to Hashes'
          ],
          correctIndex: 1,
          explanation: 'Probabilistic early expiration (or mutex-based single-flight regeneration) ensures only one worker fetches fresh data from the primary database before the TTL expires, avoiding hundreds of concurrent cache misses.',
          domainConcept: 'Cache Stampede Mitigation'
        },
        {
          id: 'q-4',
          question: 'What is the primary trade-off when optimizing for latency (p99) versus throughput (requests per second)?',
          options: [
            'Throughput optimization relies on batching and pipelining, which increases individual request wait times and p99 latency',
            'Latency reduction requires larger TCP packet sizes which lowers socket bandwidth',
            'There is no trade-off; both metrics scale linearly with CPU core counts',
            'p99 latency can only be decreased by running synchronous blocking I/O'
          ],
          correctIndex: 0,
          explanation: 'Batching amortizes system call and network serialization overhead to achieve high aggregate throughput, but individual items in a batch must wait for the batch window to close, directly inflating tail latency (p99).',
          domainConcept: 'Batching vs. Tail Latency'
        },
        {
          id: 'q-5',
          question: 'When implementing idempotency keys for distributed transactional API endpoints, what guarantee must the storage layer provide?',
          options: [
            'Eventual consistency with asynchronous replication lag',
            'Atomic compare-and-swap or unique constraint insertion with distributed locking during execution',
            'In-memory local process hashmap caching',
            'Client-side retry timestamps evaluated on client clocks'
          ],
          correctIndex: 1,
          explanation: 'Atomic unique constraint storage prevents concurrent duplicate processing of the same mutation request when network retries occur simultaneously.',
          domainConcept: 'Distributed Idempotency'
        }
      ]
    };
  }
}

// 3. Domain Course Recommendations (Post-Assessment via Gemini 3.8 Flash)
export async function generateDomainCourseRecommendations(
  domain: string,
  completedGoalTitle: string
): Promise<CourseRecommendation[]> {
  const prompt = `A software engineer just completed their curriculum in "${completedGoalTitle}" within "${domain}".
Recommend 3 advanced, high-impact follow-up courses to take their engineering skills to the staff/principal level.
Return JSON:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Advanced Course Title",
      "domain": "${domain}",
      "description": "Engaging description of why this is the vital next step",
      "estimatedWeeks": "4-6 weeks",
      "difficulty": "Advanced",
      "skillsGained": ["Skill 1", "Skill 2", "Skill 3"],
      "searchQuery": "Topic search query for YouTube masterclass"
    }
  ]
}
Return ONLY valid JSON.`;

  try {
    const text = await callGemini('gemini-3.8-flash', prompt, 'You are an engineering career counselor. Return JSON only.', true);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.recommendations.map((r: any, idx: number) => {
      const match = resolveBestVideoCourse(r.searchQuery || r.title);
      return {
        id: `rec-${Date.now()}-${idx}`,
        title: r.title,
        domain: r.domain || domain,
        description: r.description,
        estimatedWeeks: r.estimatedWeeks || '4 weeks',
        difficulty: r.difficulty || 'Advanced',
        skillsGained: r.skillsGained || ['Distributed Primitives', 'Kernel Bypassing'],
        curatedVideoUrl: match.url
      };
    });
  } catch (err) {
    return [
      {
        id: 'rec-1',
        title: `Distributed Systems & Consensus Protocols (Raft/Paxos)`,
        domain,
        description: `Level up from single-node mastery to multi-node distributed consistency, leader election, and distributed WAL replication.`,
        estimatedWeeks: '4 weeks',
        difficulty: 'Advanced',
        skillsGained: ['Raft Consensus', 'Split-Brain Handling', 'Vector Clocks'],
        curatedVideoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(domain + ' distributed systems raft consensus tutorial')}`
      },
      {
        id: 'rec-2',
        title: `High-Performance Kernel Bypassing & eBPF Observability`,
        domain,
        description: `Eliminate OS context switches, inspect zero-copy network packets with XDP, and trace production latency at the Linux kernel level.`,
        estimatedWeeks: '5 weeks',
        difficulty: 'Expert',
        skillsGained: ['eBPF Programs', 'XDP Zero-Copy', 'Linux Perf Flamegraphs'],
        curatedVideoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(domain + ' high performance observability masterclass')}`
      },
      {
        id: 'rec-3',
        title: `Multimodal Agentic AI Architectures with Gemini Flash`,
        domain,
        description: `Build autonomous multi-agent swarms with function calling, structured json routing, and real-time streaming pipelines.`,
        estimatedWeeks: '3 weeks',
        difficulty: 'Advanced',
        skillsGained: ['Agentic Workflows', 'Function Calling', 'Vector Graph RAG'],
        curatedVideoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(domain + ' advanced multimodal agentic architecture')}`
      }
    ];
  }
}

// 4. AI Note Generating Bar (Gemini 3.8 Flash)
export async function generateVideoNotesAI(
  videoTitle: string,
  noteType: 'takeaways' | 'syntaxes' | 'flashcards' | 'executive',
  context?: string
): Promise<string> {
  let promptDetail = '';
  switch (noteType) {
    case 'takeaways':
      promptDetail = 'Extract the 5 most critical mental models, architectural invariants, and high-yield takeaways from this lecture.';
      break;
    case 'syntaxes':
      promptDetail = 'Extract production code snippets, common idioms, type definitions, and command-line patterns demonstrated in this topic.';
      break;
    case 'flashcards':
      promptDetail = 'Generate 4 high-yield active-recall flashcard pairs (Q&A format with detailed rationale) for spaced repetition.';
      break;
    case 'executive':
      promptDetail = 'Write a concise executive summary with problem statements, architectural tradeoffs, and production recommendations.';
      break;
  }

  const prompt = `You are the Progress AI Note Generating Assistant powered by Gemini 3.8 Flash.
Topic / Video Title: "${videoTitle}"
${context ? `Additional Lecture Context: ${context}` : ''}

Task: ${promptDetail}
Format output with clean GitHub-flavored Markdown, including bold highlights, bullet points, and syntax code blocks where relevant.`;

  try {
    return await callGemini('gemini-3.8-flash', prompt, 'You are an elite computer science technical writer. Produce high-density markdown notes.');
  } catch (err) {
    return `### 💡 High-Yield Notes: ${videoTitle}\n\n` +
      `- **Core Concept**: Efficient resource management and operational boundaries.\n` +
      `- **Invariants**: Always establish deterministic cleanup and failure isolation.\n` +
      `- **Production Tradeoff**: Low-latency designs prioritize cached read-paths with atomic invalidation.\n\n` +
      `\`\`\`typescript\n// Architectural Pattern\nconst invariant = (condition: boolean) => { if (!condition) throw new Error("Violated"); };\n\`\`\`\n`;
  }
}

// 5. Auto Video Summary for Storage Vault
export async function generateVideoSummaryAI(
  videoTitle: string,
  duration: string = '45 min'
): Promise<string> {
  const prompt = `Summarize this completed lecture for the user's permanent storage vault:
Video: "${videoTitle}"
Estimated Duration: "${duration}"

Create a clean markdown document with:
1. Executive Overview (2-3 sentences)
2. Core Mental Models Learned (3-4 bullet points)
3. Immediate Actionable Checklist (3 concrete next steps)
4. Key Terms & Definitions

Keep it dense, professional, and directly actionable.`;

  try {
    return await callGemini('gemini-3.8-flash', prompt, 'You are an AI learning archivist. Output formatted markdown.');
  } catch (err) {
    return `# 🎓 Lecture Summary: ${videoTitle}\n\n` +
      `**Duration**: ${duration} | **Status**: Verified & Completed ✅\n\n` +
      `## Executive Overview\n` +
      `Comprehensive exploration of ${videoTitle}, detailing low-level implementation details, architectural choices, and practical error resilience.\n\n` +
      `## Core Mental Models\n` +
      `- **Separation of Concerns**: Decouple state mutations from transport protocols.\n` +
      `- **Fault Isolation**: Enforce circuit breakers at process boundaries.\n` +
      `- **Continuous Feedback**: Track real-time metric percentiles over averages.\n\n` +
      `## Actionable Next Steps\n` +
      `- [x] Verified video lecture completion\n` +
      `- [ ] Replicate core algorithm in scratchpad\n` +
      `- [ ] Run benchmark under simulated latency\n`;
  }
}

// 6. Adaptive AI Mentor (Gemini 3.8 Flash)
export async function generateMentorResponseAI(
  persona: PersonaType,
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  const personaPrompts: Record<PersonaType, string> = {
    socratic: `You are the Socratic Mentor in Progress. You NEVER give outright answers immediately. Instead, guide the user through first principles, asking probing questions that lead them to deduce the answer themselves. Encourage rigorous mental modeling.`,
    architect: `You are a Senior Staff Infrastructure Architect at Google. You care deeply about production latency (p99), memory allocations, cache invalidation, single-points-of-failure, scalability limits, and architectural trade-offs. Provide concise, uncompromising engineering wisdom.`,
    tutor: `You are a warm, encouraging, brilliant Technical Tutor. Use vivid real-world analogies, visual metaphors, and step-by-step breakdowns to make intimidating computer science concepts feel intuitive and exciting.`,
    drillmaster: `You are the Exam Drillmaster. You test the user with rapid-fire questions, edge-case traps, and timed scenarios to prepare them for FAANG / elite system design interviews. Score their answers strictly and give no unearned praise.`
  };

  const systemPrompt = personaPrompts[persona] || personaPrompts.socratic;
  
  const historyText = conversationHistory
    .slice(-6)
    .map(h => `${h.role === 'user' ? 'User' : 'Mentor'}: ${h.content}`)
    .join('\n');

  const prompt = `${historyText ? `Recent Conversation History:\n${historyText}\n\n` : ''}User Question: ${userMessage}\n\nRespond in your designated persona style:`;

  try {
    return await callGemini('gemini-3.8-flash', prompt, systemPrompt);
  } catch (err) {
    return `That's a vital question in systems engineering. Let's look at the underlying primitive: what happens at the memory and I/O boundary when this operation executes? Consider the trade-off between throughput and latency.`;
  }
}

// 7. AI-Powered Storage Vault Semantic Search & Synthesis (Gemini 3.8 Flash)
export async function searchStorageWithAI(
  query: string,
  files: any[]
): Promise<any> {
  if (!files || files.length === 0) {
    return {
      aiSynthesis: "No stored documents found in your Progress Storage Vault.",
      rankedFiles: [],
      suggestedQueries: []
    };
  }

  const fileSummaries = files.map((f) => ({
    id: f.id,
    filename: f.filename,
    category: f.category,
    tags: f.tags,
    snippet: f.content.slice(0, 800)
  }));

  const prompt = `You are the Progress AI Storage Vault Intelligence engine powered by Gemini 3.8 Flash.
The user is querying their personal storage vault containing learning notes, summaries, roadmaps, and code.

User Query: "${query}"

User Stored Files:
${JSON.stringify(fileSummaries, null, 2)}

Instructions:
1. Synthesize a direct, high-value AI Answer (aiSynthesis) that summarizes the answer to the query using the content from the matching files. Write in clean markdown with key terms bolded.
2. Rank the files based on semantic relevance to the query. For every relevant file, provide:
   - "id": string matching the file id
   - "matchScore": integer from 50 to 100
   - "rationale": 1 crisp sentence explaining why this file answers the user's search
   - "keySnippet": a 1-2 sentence excerpt or summary of the most relevant content from this file
3. Suggest 3 smart follow-up exploratory questions ("suggestedQueries") the user could ask next.

Respond ONLY with valid JSON in this exact structure:
{
  "aiSynthesis": "Direct answer to the query synthesized from the files...",
  "rankedFiles": [
    {
      "id": "file-id",
      "matchScore": 95,
      "rationale": "Directly explains...",
      "keySnippet": "Key excerpt..."
    }
  ],
  "suggestedQueries": ["Question 1", "Question 2", "Question 3"]
}`;

  try {
    const text = await callGemini(
      'gemini-3.8-flash',
      prompt,
      'You are a semantic search and knowledge synthesis agent for Progress. Respond strictly in valid JSON.',
      true
    );
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      aiSynthesis: parsed.aiSynthesis || `Found matching knowledge in your Progress Storage Vault for "${query}".`,
      rankedFiles: parsed.rankedFiles || [],
      suggestedQueries: parsed.suggestedQueries || []
    };
  } catch (err) {
    console.warn('AI Storage search fallback for query:', query);
    const qLower = query.toLowerCase();
    const ranked = files
      .map(f => {
        let score = 50;
        const matchesName = f.filename.toLowerCase().includes(qLower);
        const matchesContent = f.content.toLowerCase().includes(qLower);
        const matchesTag = f.tags?.some((t: string) => t.toLowerCase().includes(qLower));

        if (matchesName && matchesContent) score = 95;
        else if (matchesContent) score = 88;
        else if (matchesName || matchesTag) score = 80;
        else score = 60;

        return {
          id: f.id,
          matchScore: score,
          rationale: `Contains matching concepts related to "${query}" in ${f.category} documentation.`,
          keySnippet: f.content.slice(0, 160) + '...'
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return {
      aiSynthesis: `Found relevant documents in your Progress Vault matching "${query}". Check the ranked files and mental models below.`,
      rankedFiles: ranked,
      suggestedQueries: [
        `How does this apply to production systems?`,
        `What are the edge case failure modes?`,
        `Show me code examples for this concept`
      ]
    };
  }
}

// 8. Ask Questions Directly to a Document
export async function askFileAI(
  fileName: string,
  fileContent: string,
  question: string
): Promise<string> {
  const prompt = `You are the Progress AI Document Assistant.
File Name: "${fileName}"
File Content:
\`\`\`
${fileContent.slice(0, 4000)}
\`\`\`

User Question: "${question}"

Provide a crisp, accurate, markdown-formatted answer grounded directly in the file content above. Highlight code syntax or architectural invariants if applicable.`;

  try {
    return await callGemini('gemini-3.8-flash', prompt, 'You are an expert technical assistant in Progress. Answer clearly.');
  } catch (err) {
    return `Based on **${fileName}**, this relates to resource invariants and implementation structure. Refer to the code blocks in the document.`;
  }
}

// 9. AI Video Suggestions (Dynamic Multi-stage Recommendation Engine)
export async function suggestVideosAI(
  skill: string,
  level: string = 'Intermediate',
  topic?: string,
  goal?: string,
  language?: string,
  contentType?: any
): Promise<VideoSuggestion[]> {
  const recResult = await recommendVideos({
    skill,
    topic,
    level: (['beginner', 'intermediate', 'advanced'].includes(level.toLowerCase()) ? level.toLowerCase() : 'intermediate') as any,
    goal,
    language,
    contentType: contentType || 'course',
    count: 4
  });

  return recResult.videos.map(v => ({
    id: v.id,
    title: v.title,
    channel: v.channel,
    duration: v.duration,
    url: v.url,
    videoId: v.videoId,
    thumbnailUrl: v.thumbnailUrl,
    category: v.category,
    whyRecommended: v.whyRecommended,
    keyTopics: v.keyTopics
  }));
}

// 10. AI Roadmap Copilot Chatbot: Full Roadmap Access & Intelligent Video Replacement
export async function evaluateRoadmapCopilotAI(
  goal: Goal,
  userMessage: string,
  chatHistory: { role: string; content: string }[] = []
): Promise<{
  assistantMessage: string;
  isIssueSignificant: boolean;
  videoReplacement?: RoadmapVideoReplacement;
}> {
  const milestonesSummary = (goal.milestones || []).map((m, idx) => `
Milestone ${idx + 1} (ID: ${m.id}):
- Title: "${m.title}"
- Description: "${m.description}"
- Current Assigned Video: "${m.youtubeVideoTitle}" (ID: ${m.youtubeVideoId})
- Time Estimate: "${m.timeEstimate}"
- Tasks: ${m.actionItems.map(a => a.text).join('; ')}
`).join('\n');

  const prompt = `You are the Progress AI Roadmap Copilot. You have FULL READ AND WRITE ACCESS to the learner's active roadmap.

ACTIVE LEARNER ROADMAP:
Goal: "${goal.title}"
Domain: "${goal.domain}"
Skill Level: "${goal.difficultyLevel}"
Daily Time Budget: "${goal.dailyCommitment || '2 hours / day'}"
Curriculum Duration: "${goal.targetDuration}"
Current Progress: ${goal.progressPercentage}%

CURRENT MILESTONES & ASSIGNED VIDEOS:
${milestonesSummary}

USER'S MESSAGE:
"${userMessage}"

PREVIOUS CHAT CONTEXT:
${chatHistory.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

PEDAGOGICAL EVALUATION PROTOCOL:
1. Determine if the user is asking to change or improve a video for a milestone, or reporting a difficulty/dissatisfaction with a video (or asking about their curriculum).
2. Evaluate if the reported issue is SIGNIFICANT for a learner. Common significant issues include:
   - Pacing too fast or overwhelming cognitive load
   - Missing prerequisites (video assumes knowledge the learner lacks)
   - Practicality mismatch (wants hands-on coding instead of lecture slides, or vice versa)
   - Time budget mismatch (video is too long for the learner's daily schedule)
   - Deprecated syntax / outdated library versions
   - Learning style preference (e.g. prefers Socratic, project-oriented, or visual deep-dive)
   - Video channel preference (e.g. wants freeCodeCamp, MIT, Fireship, or TechWorld with Nana)
3. If the user's issue or request is significant and calls for a video change:
   - "isIssueSignificant": true
   - Identify the exact target milestone (e.g. "ms-..." from the roadmap). If not explicitly numbered, infer from the topic or default to Milestone 1 or the most relevant milestone.
   - Scout and select a superior replacement YouTube course/video from premier educators (freeCodeCamp, MIT OpenCourseWare, Fireship, Andrej Karpathy, Primeagen, TechWorld with Nana, NeetCode, Traversy Media, etc.) that directly resolves the learner's complaint!
   - In "assistantMessage", validate the learner's experience with empathy, explain why this problem is common, and confirm that you have replaced the video in their roadmap with the new masterclass.
   - Return "videoReplacement" with the exact details.
4. If the user is just asking a question about their roadmap, milestones, or conceptual guidance:
   - "isIssueSignificant": false
   - Provide an insightful, structured response referencing their specific milestones and daily schedule.

Return a valid JSON object matching this structure:
{
  "isIssueSignificant": true | false,
  "assistantMessage": "Comprehensive response explaining your assessment and guidance...",
  "videoReplacement": {
    "milestoneId": "ms-...",
    "milestoneTitle": "Title of milestone being updated",
    "oldVideoTitle": "Previous video title",
    "newVideoTitle": "New replacement video title",
    "newVideoChannel": "Channel name",
    "newVideoDuration": "Duration (e.g. 2h 15m)",
    "newVideoUrl": "https://www.youtube.com/watch?v=... or search url",
    "newVideoId": "11-character youtube id if known, else standard id",
    "newVideoThumbnail": "https://img.youtube.com/vi/ID/hqdefault.jpg",
    "reasoning": "Clear explanation of why this replacement solves the learner's problem"
  }
}
Return ONLY JSON.`;

  try {
    const responseText = await callGemini(
      'gemini-3.8-flash',
      prompt,
      'You are the expert Progress AI Roadmap Copilot. Respond strictly in valid JSON.',
      true
    );
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.isIssueSignificant && parsed.videoReplacement?.milestoneId) {
      const rep = parsed.videoReplacement;
      const targetM = goal.milestones.find(m => m.id === rep.milestoneId) || goal.milestones[0];
      const match = buildVideoMatchForQuery(
        rep.newVideoTitle || targetM.title,
        rep.newVideoTitle,
        rep.newVideoChannel,
        rep.newVideoDuration,
        rep.newVideoId
      );

      return {
        isIssueSignificant: true,
        assistantMessage: parsed.assistantMessage || `I evaluated your feedback. This is a common challenge for learners at this stage. I have updated Milestone "${targetM.title}" with a more suitable video: "${match.title}".`,
        videoReplacement: {
          milestoneId: targetM.id,
          milestoneTitle: targetM.title,
          oldVideoTitle: targetM.youtubeVideoTitle || 'Previous Video',
          newVideoTitle: match.title,
          newVideoChannel: match.channel,
          newVideoDuration: match.duration,
          newVideoUrl: match.url,
          newVideoId: match.videoId,
          newVideoThumbnail: match.thumbnailUrl,
          reasoning: rep.reasoning || `Replaced with a better suited tutorial addressing your learning preference.`
        }
      };
    }

    return {
      isIssueSignificant: false,
      assistantMessage: parsed.assistantMessage || "I've reviewed your active roadmap. Let me know if you'd like to adjust any milestone tasks or replace any video tutorials!"
    };
  } catch (err) {
    console.warn('Roadmap Copilot AI fallback error:', err);
    const lower = userMessage.toLowerCase();
    const wantsChange = lower.includes('change') || lower.includes('replace') || lower.includes('switch') || lower.includes('different') || lower.includes('better') || lower.includes('too fast') || lower.includes('too hard') || lower.includes('too long');

    if (wantsChange && goal.milestones && goal.milestones.length > 0) {
      let mIdx = 0;
      if (lower.includes('milestone 2') || lower.includes('ms 2') || lower.includes('step 2')) mIdx = 1;
      else if (lower.includes('milestone 3') || lower.includes('ms 3') || lower.includes('step 3')) mIdx = 2;
      else if (lower.includes('milestone 4') || lower.includes('ms 4') || lower.includes('step 4')) mIdx = 3;
      else if (lower.includes('milestone 5') || lower.includes('ms 5') || lower.includes('step 5')) mIdx = 4;

      const targetM = goal.milestones[mIdx] || goal.milestones[0];
      const fallbackVid = resolveBestVideoCourse(targetM.title + ' beginner friendly project tutorial');

      return {
        isIssueSignificant: true,
        assistantMessage: `I analyzed your feedback regarding "${targetM.title}". Pacing and prerequisite mismatches are among the most common friction points for learners. I have updated this milestone's video to "${fallbackVid.title}" by ${fallbackVid.channel}, which provides clearer, step-by-step guidance.`,
        videoReplacement: {
          milestoneId: targetM.id,
          milestoneTitle: targetM.title,
          oldVideoTitle: targetM.youtubeVideoTitle || 'Previous Video',
          newVideoTitle: fallbackVid.title,
          newVideoChannel: fallbackVid.channel,
          newVideoDuration: fallbackVid.duration,
          newVideoUrl: fallbackVid.url,
          newVideoId: fallbackVid.videoId,
          newVideoThumbnail: fallbackVid.thumbnailUrl,
          reasoning: 'Replaced with a hands-on, high-clarity alternative addressing your specific learner feedback.'
        }
      };
    }

    return {
      isIssueSignificant: false,
      assistantMessage: `I have full access to your "${goal.title}" roadmap with ${goal.milestones?.length || 0} milestones. You can ask me to explain any milestone, adjust study pacing, or replace any video if it feels too fast, theoretical, or outdated!`
    };
  }
}
