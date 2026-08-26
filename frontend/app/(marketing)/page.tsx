'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Search, 
  MessageSquareQuote, 
  Scissors, 
  Cpu, 
  Layers, 
  Sparkles, 
  Check, 
  Play, 
  Film, 
  ChevronRight, 
  Terminal,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const features = [
    {
      title: "Grounded Answers",
      description: "Ask in plain language. The agent searches speech and visuals together, then answers with the exact timecodes it used.",
      tag: "Multimodal Synthesis",
      mockContent: "Based on the presentation at 04:12, the architecture utilizes dense BGE embeddings combined with Whisper transcript segments to achieve sub-second grounding."
    },
    {
      title: "Clip Reels",
      description: "'Show me every moment X appears' returns a playable reel in the artifact panel — click any row to jump, or play them all back to back.",
      tag: "Interactive Player",
      mockContent: "Found 4 timestamped clips: [00:15 - 00:45], [02:30 - 03:10], [07:14 - 07:55], [12:00 - 12:40]."
    },
    {
      title: "Scene-Aware Chunking",
      description: "Speaker turns, silence, hard cuts, and semantic drift are fused into boundaries that follow the content — not a fixed clock.",
      tag: "Signal Fusion",
      mockContent: "Fused boundary signals: PySceneDetect cuts (weight 0.35) + Silero VAD silence (weight 0.40) + PyAnnote diarization (weight 0.25)."
    },
    {
      title: "Vision + Speech Index",
      description: "YOLO detection, CLIP embeddings, Whisper transcripts, and on-screen OCR land in one searchable index per chunk.",
      tag: "Dense Vector Index",
      mockContent: "Indexed 384-dim named vectors in local Qdrant collection 'videomind_chunks' with zero-latency payload filtering."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Create a Project",
      desc: "Sign in and open a workspace. Every project keeps its own videos, chats, and clips together."
    },
    {
      num: "02",
      title: "Add Your Videos",
      desc: "Drop in a file or paste a URL. Lectures, meetings, CCTV, interviews — anything with a timeline."
    },
    {
      num: "03",
      title: "Watch It Index",
      desc: "The pipeline chunks the video, runs scene, speech, object, and OCR analyzers, then embeds every chunk."
    },
    {
      num: "04",
      title: "Ask and Get Clips",
      desc: "Ask a question, tag the videos to search, and get a cited answer with the moments playable beside it."
    }
  ];

  const providers = [
    { name: "OpenAI", desc: "GPT-4o & Whisper", tag: "VLM + Audio" },
    { name: "Gemini", desc: "Gemini 1.5 Flash", tag: "Long Context" },
    { name: "Groq", desc: "Llama 3.3 70B", tag: "Ultra Fast" },
    { name: "Cerebras", desc: "Llama 3.1 8B/70B", tag: "Instant Inference" }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* Background Grid Lines & Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-60" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-black/40 to-black" />

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 transition-all duration-500 bg-black/50 backdrop-blur-2xl border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-xs shadow-lg shadow-white/10 group-hover:scale-105 transition">
              CS
            </div>
            <span className="font-semibold tracking-tight text-white text-sm">ClipScout</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-white bg-white/10 border border-white/20 transition"
            >
              Home
            </Link>
            <Link
              href="/projects"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Projects
            </Link>
            <Link
              href="/docs"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Documentation
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-300 hover:text-white transition px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/projects"
              className="px-4 py-1.5 text-xs font-semibold bg-white text-black hover:bg-neutral-200 rounded-full transition shadow-md shadow-white/10"
            >
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fast Multimodal Conversational Video RAG</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-medium leading-[1.08] tracking-tight text-white">
                Ask Your Videos <br />
                <span className="text-neutral-400">Anything.</span>
              </h1>
              <p className="max-w-lg text-sm md:text-base text-neutral-400 leading-relaxed">
                ClipScout splits footage into meaningful scenes, analyzes what was said and shown, and synthesizes answers in natural language.
                Every answer comes grounded with precise timecodes and playable clips.
              </p>
            </div>

            {/* Action Links */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/projects"
                className="group relative flex items-center justify-between px-6 py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition-all duration-300"
              >
                <span>Get Started in Workspace</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </Link>
              <Link
                href="/docs"
                className="group flex items-center justify-between px-6 py-4 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-white/30 text-white font-medium text-xs transition"
              >
                <span>See Architecture & Pipeline</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition" />
              </Link>
            </div>
          </div>

          {/* Hero Right Visual: Live Interactive Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-2 shadow-2xl backdrop-blur-xl space-y-2">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-neutral-900/50 rounded-t-xl text-[11px] font-mono text-neutral-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-neutral-500 ml-2">clipscout://workspace</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white">READY (384-DIM)</span>
              </div>

              {/* Video Player + Clip Reel Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-white/10 aspect-video flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 mt-2">Active Clip: 04:12 - 04:42</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-white/10 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span className="text-white font-semibold">Q: What is the main conclusion?</span>
                      <span>[04:12]</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 line-clamp-3">
                      At 04:12, the presenter demonstrates the sub-second retrieval accuracy using fused scene cuts and speech vectors.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>Indexed Chunks</span>
                    <span className="text-white">18 Moments Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Model Providers Banner */}
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-lg font-medium text-white">Bring your own model — ClipScout supports your preferred AI engine</h2>
            <p className="text-xs text-neutral-500">Flexible tool-calling synthesis across state-of-the-art vision and language models</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {providers.map((p, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl border border-white/10 bg-neutral-950/60 hover:bg-neutral-900 hover:border-white/30 transition duration-300 text-center space-y-2"
              >
                <div className="text-sm font-semibold text-white group-hover:text-white transition">{p.name}</div>
                <div className="text-xs text-neutral-400">{p.desc}</div>
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                  {p.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Spotlight: Search Video Like Text */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Search video like it's text
            </h2>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl">
              Retrieval that understands what was said, what was shown, and when it happened.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Tab List */}
            <div className="lg:col-span-5 space-y-3">
              {features.map((f, idx) => {
                const isActive = idx === activeFeatureTab;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveFeatureTab(idx)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'bg-neutral-900 border-white text-white shadow-xl'
                        : 'bg-neutral-950/40 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-base font-semibold">{f.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                        {f.tag}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-400">{f.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Feature Active Preview Card */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl border border-white/10 bg-neutral-950/90 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                      {features[activeFeatureTab].title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Live Agent Pipeline</span>
                </div>

                <div className="p-6 rounded-2xl bg-black border border-white/10 font-mono text-xs text-neutral-300 leading-relaxed space-y-3">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Simulated Output:</div>
                  <p>{features[activeFeatureTab].mockContent}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
                  <span>Sub-second vector lookup in Qdrant</span>
                  <Link href="/projects" className="text-white hover:underline flex items-center gap-1 font-medium">
                    <span>Try in your project</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Process Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
          <div className="space-y-3 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              From upload to answer
            </h2>
            <p className="text-neutral-400 text-sm md:text-base">
              Four steps between raw footage and a question you can finally ask it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/10 bg-neutral-950/60 hover:bg-neutral-900/80 transition duration-300 space-y-4 group"
              >
                <div className="text-2xl font-mono font-bold text-neutral-600 group-hover:text-white transition">
                  {s.num}
                </div>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer Banner */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="p-12 rounded-3xl border border-white/15 bg-gradient-to-b from-neutral-900 to-black text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Ready to chat with your video library?
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto">
              Start indexing videos in seconds. Free, private, and fully grounded with timecodes.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link
                href="/projects"
                className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-lg shadow-white/10"
              >
                Open ClipScout App
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8 px-6 text-center text-xs text-neutral-500">
        <p>© 2026 ClipScout — Conversational Video RAG Platform. Inspired by FalconVQA.</p>
      </footer>
    </div>
  );
}
