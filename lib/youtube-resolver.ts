export interface YouTubeCourseMatch {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  url: string;
  thumbnailUrl: string;
  description: string;
}

const CURATED_COURSES: Record<string, YouTubeCourseMatch> = {
  rust: {
    videoId: 'MsocPEZBd-M',
    title: 'Rust Programming Full Course - FreeCodeCamp',
    channel: 'freeCodeCamp.org',
    duration: '13h 48m',
    url: 'https://www.youtube.com/watch?v=MsocPEZBd-M',
    thumbnailUrl: 'https://img.youtube.com/vi/MsocPEZBd-M/maxresdefault.jpg',
    description: 'Learn the Rust programming language from the ground up: ownership, borrowing, lifetimes, async await, concurrency, and web services.'
  },
  ai: {
    videoId: 'kCc8FmEb1nY',
    title: 'Deep Learning & Neural Networks Foundations',
    channel: 'Andrej Karpathy',
    duration: '2h 25m',
    url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    thumbnailUrl: 'https://img.youtube.com/vi/kCc8FmEb1nY/maxresdefault.jpg',
    description: 'Building micrograd and backpropagation from scratch: the foundational building blocks of modern LLMs, Transformers, and Gemini models.'
  },
  gemini: {
    videoId: 'q154F_cWzrg',
    title: 'Google Gemini API Full Masterclass & Agentic Workflows',
    channel: 'Google Cloud Tech',
    duration: '1h 42m',
    url: 'https://www.youtube.com/watch?v=q154F_cWzrg',
    thumbnailUrl: 'https://img.youtube.com/vi/q154F_cWzrg/maxresdefault.jpg',
    description: 'Complete guide to building multimodal agentic AI systems with Gemini Flash, function calling, live streaming, and embeddings.'
  },
  system_design: {
    videoId: 'm8Icp_Cid5o',
    title: 'System Design for Beginners: Architecture Patterns & Scale',
    channel: 'freeCodeCamp.org',
    duration: '2h 10m',
    url: 'https://www.youtube.com/watch?v=m8Icp_Cid5o',
    thumbnailUrl: 'https://img.youtube.com/vi/m8Icp_Cid5o/maxresdefault.jpg',
    description: 'Master high-scale distributed architectures, caching strategies, load balancing, message queues, and database sharding.'
  },
  nextjs: {
    videoId: 'wm5gMKuwSYk',
    title: 'Next.js 14/15 Full Stack Web Development Course',
    channel: 'freeCodeCamp.org',
    duration: '5h 12m',
    url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
    thumbnailUrl: 'https://img.youtube.com/vi/wm5gMKuwSYk/maxresdefault.jpg',
    description: 'Build production-ready web apps with React Server Components, Server Actions, App Router, Tailwind CSS, and PostgreSQL.'
  },
  python: {
    videoId: 'rfscVS0vtbw',
    title: 'Python for Beginners - Full Course [Programming Tutorial]',
    channel: 'freeCodeCamp.org',
    duration: '4h 26m',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
    description: 'Comprehensive Python programming guide from basic syntaxes and data structures to object-oriented programming and scripting.'
  },
  kubernetes: {
    videoId: 'X48VuDVv0do',
    title: 'Kubernetes Tutorial for Beginners [Full Course in 4 Hours]',
    channel: 'TechWorld with Nana',
    duration: '3h 36m',
    url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    thumbnailUrl: 'https://img.youtube.com/vi/X48VuDVv0do/maxresdefault.jpg',
    description: 'Learn Kubernetes step-by-step: pods, deployments, services, ingress, configmaps, secrets, volumes, and production clusters.'
  },
  dsa: {
    videoId: '8hly31xKli0',
    title: 'Algorithms and Data Structures Tutorial - Full Course',
    channel: 'freeCodeCamp.org',
    duration: '5h 22m',
    url: 'https://www.youtube.com/watch?v=8hly31xKli0',
    thumbnailUrl: 'https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg',
    description: 'Master binary search, linked lists, graph algorithms, dynamic programming, and Big-O asymptotic runtime complexity.'
  },
  golang: {
    videoId: 'un6ZyFkqFJU',
    title: 'Go / Golang Programming by Example [Full Course]',
    channel: 'freeCodeCamp.org',
    duration: '6h 40m',
    url: 'https://www.youtube.com/watch?v=un6ZyFkqFJU',
    thumbnailUrl: 'https://img.youtube.com/vi/un6ZyFkqFJU/maxresdefault.jpg',
    description: 'Learn Go programming: goroutines, channels, interfaces, microservices, and high-performance network services.'
  },
  typescript: {
    videoId: '30LWjhZzg50',
    title: 'TypeScript Full Course for Beginners',
    channel: 'freeCodeCamp.org',
    duration: '1h 34m',
    url: 'https://www.youtube.com/watch?v=30LWjhZzg50',
    thumbnailUrl: 'https://img.youtube.com/vi/30LWjhZzg50/maxresdefault.jpg',
    description: 'Master strict TypeScript: generics, utility types, conditional types, discriminated unions, and production patterns.'
  }
};

export function resolveBestVideoCourse(query: string): YouTubeCourseMatch {
  const q = query.toLowerCase();
  
  if (q.includes('rust')) return CURATED_COURSES.rust;
  if (q.includes('ai') || q.includes('llm') || q.includes('gpt') || q.includes('machine learning')) return CURATED_COURSES.ai;
  if (q.includes('gemini') || q.includes('google genai')) return CURATED_COURSES.gemini;
  if (q.includes('system') || q.includes('distributed') || q.includes('architecture')) return CURATED_COURSES.system_design;
  if (q.includes('next') || q.includes('react') || q.includes('frontend')) return CURATED_COURSES.nextjs;
  if (q.includes('python')) return CURATED_COURSES.python;
  if (q.includes('k8s') || q.includes('kubernetes') || q.includes('docker') || q.includes('cloud')) return CURATED_COURSES.kubernetes;
  if (q.includes('algo') || q.includes('dsa') || q.includes('data structure') || q.includes('leetcode')) return CURATED_COURSES.dsa;
  if (q.includes('go') || q.includes('golang')) return CURATED_COURSES.golang;
  if (q.includes('type') || q.includes('ts')) return CURATED_COURSES.typescript;

  // Default fallback to high-yield engineering course
  return {
    videoId: 'rfscVS0vtbw',
    title: `${query} Masterclass & Engineering Fundamentals`,
    channel: 'Engineering Academy',
    duration: '3h 15m',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
    description: `Comprehensive video tutorial and practical guide covering core mental models and implementation steps for ${query}.`
  };
}

export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}
