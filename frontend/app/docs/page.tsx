import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Server, Sparkles, Terminal, Code } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-sm text-white">Documentation & API Reference</span>
            </div>
          </div>

          <Link
            href="/projects"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-12 leading-relaxed">
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            ClipScout Architecture & Reference
          </h1>
          <p className="text-slate-400 text-sm">
            ClipScout is a full-stack Conversational Video RAG platform that parses video files or URLs into semantic chunks, extracts multimodal evidence (transcripts, OCR, visual descriptions, entities), indexes them into local vector embeddings, and enables tool-calling AI agents to reason over video evidence.
          </p>
        </section>

        {/* Pipeline Breakdown */}
        <section className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Layers className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">1. Video Processing Pipeline</h2>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
            <div className="font-semibold text-white">Pipeline Stages:</div>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-slate-200">1. Ingest:</strong> Local file upload or URL resolution with content-hash caching and yt-dlp fallback.</li>
              <li><strong className="text-slate-200">2. Chunking:</strong> Fixed interval (e.g. 30s) or fused signal boundaries (cuts, silence, speaker turns).</li>
              <li><strong className="text-slate-200">3. Multimodal Analysis:</strong> Whisper audio transcription, Vision-Language scene descriptions, YOLO gating, EasyOCR gating, and speaker diarization.</li>
              <li><strong className="text-slate-200">4. Vector Indexing:</strong> Dense embeddings stored in local Qdrant collection (<code className="text-indigo-300">videomind_chunks</code>) with payload filtering.</li>
              <li><strong className="text-slate-200">5. Aggregation:</strong> Executive summaries, chapter segmentation, entity tracking, and novelty scoring.</li>
            </ul>
          </div>
        </section>

        {/* API Reference */}
        <section className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-violet-400">
            <Server className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">2. Core API Endpoints</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">POST</span>
                <code className="text-white font-mono">/videos</code>
              </div>
              <p className="text-slate-400 mt-1">Ingest a video file (multipart) or JSON with URL. Starts background processing job.</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono font-bold">GET</span>
                <code className="text-white font-mono">/videos/{`{id}`}</code>
              </div>
              <p className="text-slate-400 mt-1">Query video processing state, current stage (<code className="text-slate-300">chunking</code>, <code className="text-slate-300">transcribing</code>, <code className="text-slate-300">embedding</code>, <code className="text-slate-300">ready</code>), and progress.</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">POST</span>
                <code className="text-white font-mono">/videos/{`{id}`}/search</code>
              </div>
              <p className="text-slate-400 mt-1">Performs semantic vector search over chunk embeddings and returns ranked timestamped hits.</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">POST</span>
                <code className="text-white font-mono">/videos/{`{id}`}/ask</code>
              </div>
              <p className="text-slate-400 mt-1">Grounded question answering with LLM synthesis and timestamp citations.</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono font-bold">GET</span>
                <code className="text-white font-mono">/health</code>
              </div>
              <p className="text-slate-400 mt-1">System health, storage status, FFmpeg availability, and analyzer readiness.</p>
            </div>
          </div>
        </section>

        {/* Environment Variables */}
        <section className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-pink-400">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">3. Environment Configuration</h2>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-xs font-mono text-slate-300 space-y-2 overflow-x-auto">
            <p className="text-slate-500 font-sans font-semibold"># Core Engine (.env)</p>
            <p>OPENAI_API_KEY=sk-...</p>
            <p>QDRANT_PATH=data/qdrant</p>
            <p>VIDEOMIND_CACHE=data/cache</p>
            <p>VIDEOMIND_FFMPEG=</p>
            <div className="pt-2 text-slate-500 font-sans font-semibold"># Frontend (.env.local)</div>
            <p>NEXT_PUBLIC_CORE_API_URL=http://127.0.0.1:8077</p>
            <p>OPENAI_API_KEY=sk-...</p>
          </div>
        </section>
      </main>
    </div>
  );
}
