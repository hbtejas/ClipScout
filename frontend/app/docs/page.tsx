import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Server, Sparkles, Terminal, Code, Cpu, ShieldCheck } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans relative overflow-x-hidden">
      {/* Animated Smooth Background */}
      <AnimatedBackground showVideo={false} particleCount={30} />

      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-2xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-black text-xs shadow-md">
                CS
              </div>
              <span className="font-semibold text-sm text-white tracking-tight">Documentation & System Architecture</span>
            </div>
          </div>

          <Link
            href="/projects"
            className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-lg"
          >
            Launch App →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-12 leading-relaxed">
        {/* Intro */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">
            <Cpu className="w-3.5 h-3.5 text-white" />
            <span>Multimodal Video RAG Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            ClipScout Architecture & Engineering Guide
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            ClipScout is an end-to-end Conversational Video Retrieval-Augmented Generation (Video RAG) platform. It ingests video footage or remote streams, segments timelines through signal-fused chunking, extracts audio-visual evidence (Whisper speech, VLM scene descriptions, YOLO objects, EasyOCR text), stores dense embeddings in Qdrant, and powers an AI agent returning grounded answers with playable inline video clips.
          </p>
        </section>

        {/* Pipeline Breakdown */}
        <section className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center space-x-2 text-white">
            <Layers className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">1. Video Processing Pipeline</h2>
          </div>
          <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-6 text-xs text-neutral-300 space-y-4 backdrop-blur-xl shadow-2xl">
            <div className="font-semibold text-white font-mono text-sm">Pipeline Execution Stages:</div>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-white font-bold font-mono">01. Ingestion:</span>
                <span>Local MP4/MOV upload or remote URL resolution with sha256 content hashing and yt-dlp stream extraction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold font-mono">02. Chunking:</span>
                <span>Fixed interval (30s default) or signal-fused boundaries (hard cuts, Silero VAD silence, and speaker turn shifts).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold font-mono">03. Multimodal Analyzers:</span>
                <span>Whisper 16kHz audio transcription, OpenAI VLM scene understanding, YOLO object gating, and EasyOCR text extraction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold font-mono">04. Vector Indexing:</span>
                <span>384-dimensional dense sentence embeddings (<code className="text-white font-mono">BAAI/bge-small-en-v1.5</code>) stored in local Qdrant collections.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold font-mono">05. Hierarchical Aggregation:</span>
                <span>Automated executive video summary, timestamped chapters, cross-chunk entity tracking, and high-novelty scene flags.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* API Reference */}
        <section className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center space-x-2 text-white">
            <Server className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">2. Core FastAPI Endpoints</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-neutral-950/80 border border-white/10 rounded-2xl space-y-1 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold text-[10px]">POST</span>
                <code className="text-white font-mono">/videos</code>
              </div>
              <p className="text-neutral-400 mt-1">Ingest a video file (multipart) or JSON URL payload. Computes hash, chunks footage, and triggers background analyzer jobs.</p>
            </div>

            <div className="p-4 bg-neutral-950/80 border border-white/10 rounded-2xl space-y-1 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold text-[10px]">GET</span>
                <code className="text-white font-mono">/videos/{`{id}`}</code>
              </div>
              <p className="text-neutral-400 mt-1">Returns live processing state (<code className="text-white font-mono">queued</code>, <code className="text-white font-mono">analyzing</code>, <code className="text-white font-mono">ready</code>), active stage, and chunk metadata.</p>
            </div>

            <div className="p-4 bg-neutral-950/80 border border-white/10 rounded-2xl space-y-1 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold text-[10px]">POST</span>
                <code className="text-white font-mono">/videos/{`{id}`}/search</code>
              </div>
              <p className="text-neutral-400 mt-1">Executes semantic vector search over chunk embeddings and returns ranked moments with start/end timecodes.</p>
            </div>

            <div className="p-4 bg-neutral-950/80 border border-white/10 rounded-2xl space-y-1 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold text-[10px]">POST</span>
                <code className="text-white font-mono">/videos/{`{id}`}/ask</code>
              </div>
              <p className="text-neutral-400 mt-1">Grounded question answering over a single video with cited <code className="text-white font-mono">m:ss</code> timestamps and source moments.</p>
            </div>

            <div className="p-4 bg-neutral-950/80 border border-white/10 rounded-2xl space-y-1 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold text-[10px]">GET</span>
                <code className="text-white font-mono">/videos/{`{id}`}/insights</code>
              </div>
              <p className="text-neutral-400 mt-1">Fetches pre-computed hierarchical summary, chapter outlines, entity graphs, and novelty markers.</p>
            </div>
          </div>
        </section>

        {/* Security & Multi-tenancy */}
        <section className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center space-x-2 text-white">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">3. Security & Database Isolation</h2>
          </div>
          <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-6 text-xs text-neutral-400 space-y-3 backdrop-blur-xl">
            <p>
              ClipScout enforces Row Level Security (RLS) across all user tables (<code className="text-white font-mono">projects</code>, <code className="text-white font-mono">videos</code>, <code className="text-white font-mono">conversations</code>, <code className="text-white font-mono">messages</code>) with user-scoped storage policies in Supabase. Service role keys remain strictly server-isolated.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-neutral-500 font-mono">
          ClipScout © 2026 — Multimodal Conversational Video RAG Platform
        </div>
      </footer>
    </div>
  );
}
