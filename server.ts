import http from 'http';
import {
  evaluateRoadmapCopilotAI,
  generateRoadmapAI,
  suggestVideosAI,
  generatePostGoalQuiz,
  generateFollowUpCourses,
  mentorDialogueAI,
  generateVideoSummaryAI,
  generateVideoNotesAI
} from './lib/gemini';
import { Goal } from './lib/types';

const PORT = parseInt(process.env.PORT || '10000', 10);

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Root Dashboard
  if (pathname === '/' && req.method === 'GET') {
    sendJson(res, 200, {
      service: 'Progress AI Backend Engine',
      status: 'online',
      version: '1.0.0',
      host: 'Render Cloud (Oregon, USA)',
      timestamp: new Date().toISOString(),
      endpoints: [
        { path: '/health', method: 'GET', description: 'Service health check' },
        { path: '/api/roadmap/copilot', method: 'POST', description: 'Omni-access Roadmap Copilot & video replacement' },
        { path: '/api/goals/generate', method: 'POST', description: 'Generate 5 sequential milestones with unique videos' },
        { path: '/api/video/suggest', method: 'POST', description: 'Scout premier YouTube courses for any skill' },
        { path: '/api/goals/quiz', method: 'POST', description: 'Generate domain assessment quiz or exam' },
        { path: '/api/goals/recommend', method: 'POST', description: 'Follow-up curriculum recommendations' },
        { path: '/api/mentor/chat', method: 'POST', description: 'AI Mentor dialogue with multiple personas' }
      ]
    });
    return;
  }

  // Health check
  if (pathname === '/health' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
    return;
  }

  // API Route: Roadmap Copilot (AI Video Replacement)
  if (pathname === '/api/roadmap/copilot' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { goal, userMessage, chatHistory } = body;
      if (!goal || !goal.milestones) {
        sendJson(res, 400, { error: 'Valid goal object with milestones is required' });
        return;
      }
      if (!userMessage) {
        sendJson(res, 400, { error: 'userMessage is required' });
        return;
      }

      const evaluation = await evaluateRoadmapCopilotAI(
        goal as Goal,
        userMessage,
        chatHistory || []
      );

      sendJson(res, 200, { success: true, ...evaluation });
    } catch (err: any) {
      console.error('Copilot API error:', err);
      sendJson(res, 500, { error: err.message || 'Roadmap copilot evaluation failed' });
    }
    return;
  }

  // API Route: Goals Generate
  if (pathname === '/api/goals/generate' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { goalTitle, targetDuration, difficultyLevel, learningStyle, dailyCommitment } = body;
      if (!goalTitle) {
        sendJson(res, 400, { error: 'goalTitle is required' });
        return;
      }

      const goal = await generateRoadmapAI(
        goalTitle,
        targetDuration || '30 days',
        difficultyLevel || 'Intermediate',
        learningStyle || 'Socratic Deep-Dive',
        dailyCommitment || '2 hours / day'
      );

      sendJson(res, 200, { success: true, goal });
    } catch (err: any) {
      console.error('Goal generate error:', err);
      sendJson(res, 500, { error: err.message || 'Failed to generate roadmap' });
    }
    return;
  }

  // API Route: Video Suggest
  if (pathname === '/api/video/suggest' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { skill, level } = body;
      if (!skill) {
        sendJson(res, 400, { error: 'skill is required' });
        return;
      }

      const suggestions = await suggestVideosAI(skill, level || 'Intermediate');
      sendJson(res, 200, { success: true, skill, suggestions });
    } catch (err: any) {
      console.error('Video suggest error:', err);
      sendJson(res, 500, { error: err.message || 'Failed to suggest videos' });
    }
    return;
  }

  // API Route: Quiz
  if (pathname === '/api/goals/quiz' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { domain, goalTitle, type } = body;
      const quiz = await generatePostGoalQuiz(
        domain || 'Computer Science',
        goalTitle || 'Systems Engineering',
        type || 'rapid'
      );
      sendJson(res, 200, { success: true, quiz });
    } catch (err: any) {
      console.error('Quiz error:', err);
      sendJson(res, 500, { error: err.message || 'Failed to generate quiz' });
    }
    return;
  }

  // API Route: Course Recommendations
  if (pathname === '/api/goals/recommend' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { goal } = body;
      const recommendations = await generateFollowUpCourses(goal);
      sendJson(res, 200, { success: true, recommendations });
    } catch (err: any) {
      console.error('Recommend error:', err);
      sendJson(res, 500, { error: err.message || 'Failed to generate recommendations' });
    }
    return;
  }

  // 404 Fallback
  sendJson(res, 404, {
    error: 'Endpoint not found',
    requestedPath: pathname,
    supportedEndpoints: ['/', '/health', '/api/roadmap/copilot', '/api/goals/generate', '/api/video/suggest', '/api/goals/quiz', '/api/goals/recommend']
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Progress AI Backend] Server running on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
});
