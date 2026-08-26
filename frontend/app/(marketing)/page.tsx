'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Search, 
  MessageSquareQuote, 
  Scissors, 
  AudioLines, 
  Scan, 
  Clapperboard, 
  ChartColumn, 
  Server, 
  Zap, 
  Cpu, 
  ChevronRight,
  Play,
  Film
} from 'lucide-react';

import { AnimatedBackground } from '@/components/ui/animated-background';

export default function LandingPage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const features = [
    {
      title: "Grounded Answers",
      description: "Ask in plain language. The agent searches speech and visuals together, then answers with the exact timecodes it used.",
      tag: "Multimodal Synthesis",
      mockTitle: "Agent Synthesis [04:12 - 04:38]",
      mockContent: "Based on the presentation at 04:12, the architecture utilizes dense BGE sentence embeddings combined with Whisper transcript segments to achieve sub-second grounding."
    },
    {
      title: "Clip Reels",
      description: "'Show me every moment X appears' returns a playable reel in the artifact panel — click any row to jump, or play them all back to back.",
      tag: "Interactive Player",
      mockTitle: "Retrieved Clip Reel (4 moments)",
      mockContent: "Found 4 timestamped clips: [00:15 - 00:45], [02:30 - 03:10], [07:14 - 07:55], [12:00 - 12:40]. Jump to any clip or play sequence inline."
    },
    {
      title: "Scene-Aware Chunking",
      description: "Speaker turns, silence, hard cuts, and semantic drift are fused into boundaries that follow the content — not a fixed clock.",
      tag: "Signal Fusion",
      mockTitle: "Signal-Fused Boundaries",
      mockContent: "Fused boundary signals: PySceneDetect cuts (weight 0.35) + Silero VAD silence (weight 0.40) + PyAnnote diarization (weight 0.25)."
    },
    {
      title: "Vision + Speech Index",
      description: "YOLO detection, CLIP embeddings, Whisper transcripts, and on-screen OCR land in one searchable index per chunk.",
      tag: "Dense Vector Index",
      mockTitle: "Payload Embeddings (384-dim)",
      mockContent: "Indexed 384-dim named vectors in local Qdrant collection 'videomind_chunks' with zero-latency metadata filtering."
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

  const bentoCards = [
    {
      icon: Search,
      title: "Semantic Moment Search",
      desc: "Describe what you are looking for and get ranked, timestamped moments across every tagged video."
    },
    {
      icon: MessageSquareQuote,
      title: "Cited Answers",
      desc: "Responses stay short and point back at the m:ss timecodes the evidence came from."
    },
    {
      icon: Scissors,
      title: "Clip Artifact Panel",
      desc: "Retrieved moments become a reel you can scrub, filter, and play end to end."
    },
    {
      icon: AudioLines,
      title: "Speech & Speakers",
      desc: "Whisper transcripts with diarization, so you know who said what and exactly when."
    },
    {
      icon: Scan,
      title: "Visual Understanding",
      desc: "YOLO detection, CLIP embeddings, and on-screen OCR describe what the frame actually shows."
    },
    {
      icon: Clapperboard,
      title: "Scenes & Chapters",
      desc: "An interactive timeline of scenes, chapters, and events you can jump straight into."
    },
    {
      icon: ChartColumn,
      title: "Video-Level Insights",
      desc: "Aggregators roll chunks up into entity timelines, co-occurrence, sentiment, and stats."
    },
    {
      icon: Server,
      title: "Self-Hosted Core",
      desc: "FastAPI, PyTorch, and Qdrant run the pipeline on your own hardware — your footage stays yours."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Interactive Cool Animated Background */}
      <AnimatedBackground showVideo={true} particleCount={40} />

      {/* Top Header */}
      <header className="fixed left-0 right-0 top-0 z-50 transition-all duration-500 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="group relative flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-xs shadow-lg shadow-white/10 group-hover:scale-105 transition">
                CS
              </div>
              <span className="font-medium tracking-tight text-white text-sm">ClipScout</span>
            </Link>

            <nav className="relative hidden md:block">
              <ul className="flex items-center gap-1">
                <li className="relative flex items-center justify-center">
                  <Link href="/" className="relative flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20">
                    Home
                  </Link>
                </li>
                <li className="relative flex items-center justify-center">
                  <Link href="/projects" className="relative flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition">
                    Projects
                  </Link>
                </li>
                <li className="relative flex items-center justify-center">
                  <Link href="/docs" className="relative flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition">
                    Documentation
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex text-xs font-medium text-neutral-400 hover:text-white transition px-3 py-1.5">
                Sign In
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold bg-white text-black hover:bg-neutral-200 rounded-full transition shadow-md shadow-white/10"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-28 sm:pt-36">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[80vh] flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium leading-[1.08] tracking-tight text-white">
                  Ask Your Videos<br />Anything
                </h1>
                <p className="max-w-xl text-base sm:text-lg text-neutral-300 leading-relaxed">
                  <span className="text-white font-medium">Fast Augmented Language-based CONversational Video Question Answering.</span>{' '}
                  ClipScout splits footage into meaningful scenes, understands what was said and shown, and answers in plain language.
                  <br className="hidden sm:block" /> Every answer comes back with timecodes and playable clips.
                </p>
              </div>

              {/* Dual Sliding CTA Buttons */}
              <ul className="flex w-full flex-col border-y border-white/10 divide-y divide-white/10 lg:w-[80%]">
                <li className="w-full">
                  <Link
                    href="/projects"
                    className="group relative flex w-full items-center justify-between overflow-hidden transition-all duration-500"
                  >
                    <div className="flex w-full items-center justify-between transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:-translate-y-full px-6 py-5">
                      <span className="font-medium text-white text-sm">Get Started</span>
                      <ArrowUpRight className="h-5 w-5 text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <div className="absolute inset-0 flex w-full translate-y-[calc(100%+1px)] items-center justify-between bg-white text-black transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:translate-y-0 px-6 py-5">
                      <span className="font-medium text-black text-sm">Get Started</span>
                      <ArrowUpRight className="h-5 w-5 text-black" />
                    </div>
                  </Link>
                </li>
                <li className="w-full">
                  <Link
                    href="/docs"
                    className="group relative flex w-full items-center justify-between overflow-hidden transition-all duration-500"
                  >
                    <div className="flex w-full items-center justify-between transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:-translate-y-full px-6 py-5">
                      <span className="font-medium text-neutral-400 group-hover:text-white transition-colors text-sm">See How It Works</span>
                      <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute inset-0 flex w-full translate-y-[calc(100%+1px)] items-center justify-between bg-white text-black transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:translate-y-0 px-6 py-5">
                      <span className="font-medium text-black text-sm">See How It Works</span>
                      <ArrowUpRight className="h-5 w-5 text-black" />
                    </div>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Hero Preview Window */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-2 backdrop-blur-2xl shadow-[0_3rem_4rem_1rem_rgba(0,0,0,0.8)] space-y-3">
                {/* Mock Browser Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs text-neutral-400 font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-neutral-300">workspace / project_demo_01</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px]">RAG Engine Active</span>
                </div>

                {/* Mock Workspace Content */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Mock Chat */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white text-black text-xs font-medium shadow-md">
                      Where is the vector database architecture described?
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-200 text-xs leading-relaxed space-y-2">
                      <p>The vector database architecture is shown at <strong>04:12</strong> using dense 384-dim BGE embeddings in Qdrant.</p>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                        ⏱️ 04:12 – 04:38
                      </div>
                    </div>
                  </div>

                  {/* Right Mock Video Player */}
                  <div className="rounded-xl overflow-hidden bg-black border border-white/10 aspect-video flex flex-col justify-between p-3 relative group">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Clip Artifact Player</span>
                      <span className="text-white bg-white/10 px-1.5 py-0.5 rounded">04:12</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mx-auto shadow-xl">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-3/5 h-full bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bring Your Own Model — Supported Providers Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/10 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/[0.04] rounded-full blur-[100px] pointer-events-none -z-10 animate-halo" />

          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-[11px] font-mono text-neutral-300 backdrop-blur-md shadow-inner transition duration-300 hover:border-white/30 hover:bg-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cpu className="w-3.5 h-3.5 text-neutral-300 ml-0.5" />
              <span className="tracking-wide">Multi-Provider Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Bring your own model —{' '}
              <span className="bg-gradient-to-r from-white via-neutral-100 to-white/60 bg-clip-text text-transparent animate-shimmer">
                ClipScout
              </span>{' '}
              supports these providers
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Seamlessly swap foundation models for transcription, visual scene indexing, and agentic<br className="hidden sm:inline" /> video reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* OpenAI Card */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer animate-float-1">
              <div className="w-full aspect-[2.2/1] bg-white rounded-3xl p-5 flex items-center justify-center shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.35)]">
                <div className="flex items-center gap-2.5">
                  <svg className="w-7 h-7 text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-12 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.02 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                  </svg>
                  <span className="font-bold text-black text-xl tracking-tight">OpenAI</span>
                </div>
              </div>
              <div className="text-center space-y-1 transition-all duration-300 group-hover:translate-y-0.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 font-semibold group-hover:text-neutral-300 transition-colors">OPENAI</span>
                <p className="text-xs font-semibold text-white">GPT-4o & Whisper</p>
                <span className="inline-block text-[10px] font-mono px-3 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15 group-hover:border-white/30 group-hover:bg-white/15 transition-all">
                  VLM + Audio
                </span>
              </div>
            </div>

            {/* Gemini Card */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer animate-float-2">
              <div className="w-full aspect-[2.2/1] bg-white rounded-3xl p-5 flex items-center justify-center shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_0_40px_rgba(66,133,244,0.4)]">
                <div className="flex items-center gap-2.5">
                  <svg className="w-7 h-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"/>
                    <path fill="#EA4335" d="M12 0C12 4.418 8.418 8 4 8c4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z"/>
                    <path fill="#FBBC05" d="M12 4c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z"/>
                    <path fill="#34A853" d="M12 4c0 3.314-2.686 6-6 6 3.314 0 6 2.686 6 6 0-3.314 2.686-6 6-6-3.314 0-6-2.686-6-6z"/>
                  </svg>
                  <span className="font-bold text-neutral-900 text-xl tracking-tight">Gemini</span>
                </div>
              </div>
              <div className="text-center space-y-1 transition-all duration-300 group-hover:translate-y-0.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 font-semibold group-hover:text-neutral-300 transition-colors">GEMINI</span>
                <p className="text-xs font-semibold text-white">Gemini 1.5 Flash</p>
                <span className="inline-block text-[10px] font-mono px-3 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15 group-hover:border-white/30 group-hover:bg-white/15 transition-all">
                  Long Context
                </span>
              </div>
            </div>

            {/* Groq Card */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer animate-float-3">
              <div className="w-full aspect-[2.2/1] bg-white rounded-3xl p-5 flex items-center justify-center shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_0_40px_rgba(245,80,54,0.4)]">
                <div className="flex items-center">
                  <span className="font-black text-[#F55036] text-3xl tracking-tighter lowercase font-sans transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                    groq
                  </span>
                </div>
              </div>
              <div className="text-center space-y-1 transition-all duration-300 group-hover:translate-y-0.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 font-semibold group-hover:text-neutral-300 transition-colors">GROQ</span>
                <p className="text-xs font-semibold text-white">Llama 3.3 70B</p>
                <span className="inline-block text-[10px] font-mono px-3 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15 group-hover:border-white/30 group-hover:bg-white/15 transition-all">
                  Ultra Fast
                </span>
              </div>
            </div>

            {/* Cerebras Card */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer animate-float-4">
              <div className="w-full aspect-[2.2/1] bg-white rounded-3xl p-5 flex items-center justify-center shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_0_40px_rgba(255,108,55,0.4)]">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#FF6C37] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="3" fill="#FF6C37"/>
                    <path d="M12 2a10 10 0 0 0-7.07 17.07l1.41-1.41A8 8 0 0 1 12 4V2z" fill="#FF6C37"/>
                    <path d="M12 6a6 6 0 0 0-4.24 10.24l1.41-1.41A4 4 0 0 1 12 8V6z" fill="#FF6C37"/>
                    <path d="M22 12a10 10 0 0 0-17.07-7.07l1.41 1.41A8 8 0 0 1 20 12h2z" fill="#FF6C37"/>
                    <path d="M18 12a6 6 0 0 0-10.24-4.24l1.41 1.41A4 4 0 0 1 16 12h2z" fill="#FF6C37"/>
                  </svg>
                  <span className="font-bold text-black text-lg tracking-tight lowercase">cerebras</span>
                </div>
              </div>
              <div className="text-center space-y-1 transition-all duration-300 group-hover:translate-y-0.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 font-semibold group-hover:text-neutral-300 transition-colors">CEREBRAS</span>
                <p className="text-xs font-semibold text-white">Llama 3.1 8B/70B</p>
                <span className="inline-block text-[10px] font-mono px-3 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15 group-hover:border-white/30 group-hover:bg-white/15 transition-all">
                  Instant Inference
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Spotlight: Search Video Like Text */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/10">
          <div className="space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Search video like it&apos;s text
            </h2>
            <p className="text-neutral-400 text-base md:text-lg max-w-xl">
              Retrieval that understands what was said, what was shown, and when it happened.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Feature Accordion List */}
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

            {/* Feature Active Live Card Preview */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl border border-white/10 bg-neutral-950/90 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                      {features[activeFeatureTab].title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Live Pipeline Simulation</span>
                </div>

                <div className="p-6 rounded-2xl bg-black border border-white/10 font-mono text-xs text-neutral-300 leading-relaxed space-y-3">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    {features[activeFeatureTab].mockTitle}
                  </div>
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

        {/* 4-Step Process Section: From upload to answer */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/10">
          <div className="space-y-3 mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              From upload to answer
            </h2>
            <p className="text-neutral-400 text-base md:text-lg">
              Four steps between raw footage and a question you can finally ask it.
            </p>
          </div>

          <ul className="relative border-b border-white/10 divide-y divide-white/10">
            {steps.map((s, idx) => (
              <li
                key={idx}
                className="group relative bg-white/5 backdrop-blur-xl overflow-hidden transition-colors hover:bg-white/10"
              >
                <div className="relative z-10 grid py-8 md:grid-cols-12 md:gap-8 px-4 md:px-8 items-center">
                  <div className="mb-2 md:col-span-2 md:mb-0">
                    <span className="font-mono text-sm text-neutral-500 group-hover:text-white transition-colors">
                      {s.num}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold text-white transition-colors duration-300 md:text-2xl">
                      {s.title}
                    </h3>
                  </div>
                  <div className="mt-2 md:col-span-6 md:mt-0">
                    <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors text-sm">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Built for Video Bento Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/10">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Built for video
            </h2>
            <p className="text-base md:text-lg text-neutral-400">
              A full retrieval stack — chunking, analysis, indexing, and answers — purpose-built for footage.
            </p>
          </div>

          <div className="border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {bentoCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="group relative backdrop-blur-xl bg-white/5 overflow-hidden p-8 hover:bg-white/10 transition duration-300 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="inline-flex rounded-lg bg-white/10 p-3 ring-1 ring-white/20 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stop Scrubbing. Start Asking CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="group relative grid gap-px overflow-hidden backdrop-blur-xl border border-white/10 md:grid-cols-2 rounded-3xl bg-neutral-950/80">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 md:p-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Stop scrubbing. Start asking.
              </h2>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                Upload your first video and find the moment you need in seconds — no more dragging the playhead hoping to land on it.
              </p>
            </div>

            <div className="relative z-10 flex flex-col justify-center bg-white/5 border-t md:border-t-0 md:border-l border-white/10 divide-y divide-white/10">
              <Link
                href="/projects"
                className="group/link relative flex w-full items-center justify-between overflow-hidden transition-all duration-500 px-6 py-8 md:px-12 md:py-10 hover:bg-white/5"
              >
                <div className="flex w-full items-center justify-between transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover/link:-translate-y-full">
                  <span className="font-medium text-white text-sm md:text-base">Upload a Video</span>
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 flex w-full translate-y-[calc(100%+1px)] items-center justify-between bg-white text-black transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover/link:translate-y-0 px-6 py-8 md:px-12 md:py-10">
                  <span className="font-medium text-black text-sm md:text-base">Upload a Video</span>
                  <ArrowUpRight className="h-5 w-5 text-black" />
                </div>
              </Link>

              <Link
                href="/docs"
                className="group/link relative flex w-full items-center justify-between overflow-hidden transition-all duration-500 px-6 py-8 md:px-12 md:py-10 hover:bg-white/5"
              >
                <div className="flex w-full items-center justify-between transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover/link:-translate-y-full">
                  <span className="font-medium text-white text-sm md:text-base">Explore the Architecture</span>
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 flex w-full translate-y-[calc(100%+1px)] items-center justify-between bg-white text-black transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover/link:translate-y-0 px-6 py-8 md:px-12 md:py-10">
                  <span className="font-medium text-black text-sm md:text-base">Explore the Architecture</span>
                  <ArrowUpRight className="h-5 w-5 text-black" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/70 backdrop-blur-xl border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Platform</p>
              <div className="flex flex-col gap-2.5 text-sm">
                <Link href="/projects" className="text-neutral-400 hover:text-white transition">Projects</Link>
                <Link href="/projects" className="text-neutral-400 hover:text-white transition">Agent Workspace</Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Resources</p>
              <div className="flex flex-col gap-2.5 text-sm">
                <Link href="/docs" className="text-neutral-400 hover:text-white transition">Architecture</Link>
                <a href="https://github.com/hbtejas/ClipScout" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition">GitHub</a>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col items-start lg:items-end text-left lg:text-right space-y-3">
              <h2 className="text-3xl font-medium tracking-tight text-white">ClipScout</h2>
              <p className="text-neutral-400 text-sm max-w-sm">
                Retrieval-augmented generation for video — grounded answers, timecodes, and playable clips.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono">
            <p>© 2026 ClipScout. All rights reserved.</p>
            <p>Multimodal Conversational Video RAG Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
