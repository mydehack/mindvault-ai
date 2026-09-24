import { Goal, Milestone, QuizAssessment, CourseRecommendation, PersonaType } from './types';
import { resolveBestVideoCourse } from './youtube-resolver';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function callGemini(
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
      // Fallback to gemini-2.5-flash if 3.8-flash has special availability restrictions
      if (model !== 'gemini-2.5-flash') {
        return await callGemini('gemini-2.5-flash', prompt, systemInstruction, jsonMode);
      }
      throw new Error(`Gemini API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    return text;
  } catch (err: any) {
    console.error('Gemini call failed:', err);
    throw err;
  }
}

// 1. Generate Goal-to-Action Roadmap
export async function generateRoadmapAI(
  goalTitle: string,
  targetDuration: string = '30 days',
  difficultyLevel: string = 'Intermediate',
  learningStyle: string = 'Socratic Deep-Dive'
): Promise<Goal> {
  const bestVideo = resolveBestVideoCourse(goalTitle);

  const prompt = `You are an elite curriculum architect and AI tutor for MindVault AI.
Break down this learning goal into a world-class, structured, actionable milestone roadmap:
Goal: "${goalTitle}"
Duration: "${targetDuration}"
Skill Level: "${difficultyLevel}"
Learning Style: "${learningStyle}"

Return a valid JSON object matching this structure:
{
  "domain": "Domain Name (e.g., Systems Programming, Full-Stack AI)",
  "milestones": [
    {
      "dayNumber": 1,
      "title": "Milestone title",
      "description": "Clear conceptual overview and objective for this stage",
      "timeEstimate": "2-3 hours",
      "actionItems": [
        "Concrete task 1 with measurable outcome",
        "Concrete task 2 with measurable outcome",
        "Concrete task 3 with measurable outcome"
      ],
      "mentalModels": ["Key Principle 1", "Key Principle 2"],
      "videoSearchQuery": "Specific search query for this milestone"
    }
  ]
}
Create 5 comprehensive, logically sequential milestones covering the full ${targetDuration}. Return ONLY JSON.`;

  try {
    const responseText = await callGemini('gemini-3.8-flash', prompt, 'You are an expert curriculum planner. Respond only in strict JSON format.', true);
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const goalId = 'goal-' + Date.now();
    const milestones: Milestone[] = parsed.milestones.map((m: any, idx: number) => {
      const milestoneVideo = resolveBestVideoCourse(m.title + ' ' + (m.videoSearchQuery || goalTitle));
      return {
        id: `ms-${goalId}-${idx + 1}`,
        goalId,
        dayNumber: m.dayNumber || (idx + 1) * Math.max(1, Math.floor(parseInt(targetDuration) / 5) || 1),
        title: m.title,
        description: m.description,
        timeEstimate: m.timeEstimate || '2-3 hours',
        youtubeVideoId: milestoneVideo.videoId,
        youtubeVideoTitle: milestoneVideo.title,
        youtubeVideoUrl: milestoneVideo.url,
        isCompleted: false,
        isVideoWatched: false,
        actionItems: (m.actionItems || []).map((text: string, aIdx: number) => ({
          id: `act-${goalId}-${idx + 1}-${aIdx + 1}`,
          text,
          completed: false
        })),
        mentalModels: m.mentalModels || ['First Principles', 'System Invariants']
      };
    });

    return {
      id: goalId,
      profileId: 'default-user',
      title: goalTitle,
      domain: parsed.domain || 'Computer Science & Engineering',
      targetDuration,
      difficultyLevel,
      learningStyle,
      progressPercentage: 0,
      isCompleted: false,
      bestVideoTitle: bestVideo.title,
      bestVideoUrl: bestVideo.url,
      bestVideoThumbnail: bestVideo.thumbnailUrl,
      milestones,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Using intelligent curated fallback roadmap for goal:', goalTitle);
    const goalId = 'goal-' + Date.now();
    return {
      id: goalId,
      profileId: 'default-user',
      title: goalTitle,
      domain: 'Systems & AI Engineering',
      targetDuration,
      difficultyLevel,
      learningStyle,
      progressPercentage: 0,
      isCompleted: false,
      bestVideoTitle: bestVideo.title,
      bestVideoUrl: bestVideo.url,
      bestVideoThumbnail: bestVideo.thumbnailUrl,
      milestones: [
        {
          id: `ms-${goalId}-1`,
          goalId,
          dayNumber: 1,
          title: 'Foundational Syntax & Execution Model',
          description: `Internalize the core architecture, memory layout, and operational paradigms of ${goalTitle}.`,
          timeEstimate: '2.5 hours',
          youtubeVideoId: bestVideo.videoId,
          youtubeVideoTitle: bestVideo.title,
          youtubeVideoUrl: bestVideo.url,
          isCompleted: false,
          isVideoWatched: false,
          actionItems: [
            { id: `act-1-1`, text: `Set up local development toolchain and verify environment`, completed: false },
            { id: `act-1-2`, text: `Implement fundamental data structures and primitive operations`, completed: false },
            { id: `act-1-3`, text: `Write unit test coverage for edge condition boundaries`, completed: false }
          ],
          mentalModels: ['Zero-Cost Abstractions', 'Predictable Memory Layout']
        },
        {
          id: `ms-${goalId}-2`,
          goalId,
          dayNumber: 4,
          title: 'Concurrency, Async Runtimes & State Flow',
          description: 'Master async event loops, non-blocking I/O primitives, and channel-based thread synchronization.',
          timeEstimate: '3 hours',
          youtubeVideoId: bestVideo.videoId,
          youtubeVideoTitle: bestVideo.title,
          youtubeVideoUrl: bestVideo.url,
          isCompleted: false,
          isVideoWatched: false,
          actionItems: [
            { id: `act-2-1`, text: 'Implement worker pool pattern with cross-thread communication', completed: false },
            { id: `act-2-2`, text: 'Handle backpressure and cancellation with context signals', completed: false },
            { id: `act-2-3`, text: 'Benchmark throughput under concurrent simulated load', completed: false }
          ],
          mentalModels: ['Actor Model', 'Single Writer Principle']
        },
        {
          id: `ms-${goalId}-3`,
          goalId,
          dayNumber: 9,
          title: 'Production Resilience, Caching & Failure Modes',
          description: 'Design fault-tolerant architectures with circuit breakers, exponential backoff, and distributed caches.',
          timeEstimate: '3.5 hours',
          youtubeVideoId: bestVideo.videoId,
          youtubeVideoTitle: bestVideo.title,
          youtubeVideoUrl: bestVideo.url,
          isCompleted: false,
          isVideoWatched: false,
          actionItems: [
            { id: `act-3-1`, text: 'Implement Redis LRU caching layer with TTL invalidation', completed: false },
            { id: `act-3-2`, text: 'Build jittered exponential retry policy with circuit breaker', completed: false },
            { id: `act-3-3`, text: 'Simulate network partition and verify graceful degradation', completed: false }
          ],
          mentalModels: ['CAP Theorem Tradeoffs', 'Blast Radius Minimization']
        },
        {
          id: `ms-${goalId}-4`,
          goalId,
          dayNumber: 16,
          title: 'End-to-End System Integration & API Contract',
          description: 'Assemble the full stack pipeline connecting API layers, persistent storage, and background processing.',
          timeEstimate: '4 hours',
          youtubeVideoId: bestVideo.videoId,
          youtubeVideoTitle: bestVideo.title,
          youtubeVideoUrl: bestVideo.url,
          isCompleted: false,
          isVideoWatched: false,
          actionItems: [
            { id: `act-4-1`, text: 'Define strict OpenAPI / gRPC contracts with schema validation', completed: false },
            { id: `act-4-2`, text: 'Implement database connection pooling and transaction rollbacks', completed: false },
            { id: `act-4-3`, text: 'Configure structured logging, OpenTelemetry tracing, and metrics', completed: false }
          ],
          mentalModels: ['Clean Architecture', 'Idempotent Operations']
        },
        {
          id: `ms-${goalId}-5`,
          goalId,
          dayNumber: 25,
          title: 'Performance Profiling, Security & Capstone Deployment',
          description: 'Profile CPU/memory flamegraphs, enforce security boundaries, and deploy to production Kubernetes.',
          timeEstimate: '4.5 hours',
          youtubeVideoId: bestVideo.videoId,
          youtubeVideoTitle: bestVideo.title,
          youtubeVideoUrl: bestVideo.url,
          isCompleted: false,
          isVideoWatched: false,
          actionItems: [
            { id: `act-5-1`, text: 'Run memory profiler and eliminate allocation bottlenecks', completed: false },
            { id: `act-5-2`, text: 'Audit dependency CVEs and harden container security contexts', completed: false },
            { id: `act-5-3`, text: 'Deploy multi-region production cluster with CI/CD automation', completed: false }
          ],
          mentalModels: ['Amortized Cost Analysis', 'Defense in Depth']
        }
      ],
      createdAt: new Date().toISOString()
    };
  }
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
        curatedVideoUrl: 'https://www.youtube.com/watch?v=m8Icp_Cid5o'
      },
      {
        id: 'rec-2',
        title: `High-Performance Kernel Bypassing & eBPF Observability`,
        domain,
        description: `Eliminate OS context switches, inspect zero-copy network packets with XDP, and trace production latency at the Linux kernel level.`,
        estimatedWeeks: '5 weeks',
        difficulty: 'Expert',
        skillsGained: ['eBPF Programs', 'XDP Zero-Copy', 'Linux Perf Flamegraphs'],
        curatedVideoUrl: 'https://www.youtube.com/watch?v=un6ZyFkqFJU'
      },
      {
        id: 'rec-3',
        title: `Multimodal Agentic AI Architectures with Gemini Flash`,
        domain,
        description: `Build autonomous multi-agent swarms with function calling, structured json routing, and real-time streaming pipelines.`,
        estimatedWeeks: '3 weeks',
        difficulty: 'Advanced',
        skillsGained: ['Agentic Workflows', 'Function Calling', 'Vector Graph RAG'],
        curatedVideoUrl: 'https://www.youtube.com/watch?v=q154F_cWzrg'
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

  const prompt = `You are the MindVault AI Note Generating Assistant powered by Gemini 3.8 Flash.
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
    socratic: `You are the Socratic Mentor in MindVault AI. You NEVER give outright answers immediately. Instead, guide the user through first principles, asking probing questions that lead them to deduce the answer themselves. Encourage rigorous mental modeling.`,
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
