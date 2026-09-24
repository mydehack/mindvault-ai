import type { Metadata } from 'next';
import './globals.css';
import { SkiperGooeyFilterProvider } from '@/components/ui/skiper-ui/skiper64';

export const metadata: Metadata = {
  title: 'MindVault AI — Goal-to-Action OS & Digital Memory Vault',
  description: 'Production-ready full-stack learning operating system with Google Gemini 3.8 Flash, pgvector memory, and adaptive AI mentoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <SkiperGooeyFilterProvider />
        {children}
      </body>
    </html>
  );
}
