'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Video, SourceMoment } from '@/types';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ClipArtifactPanel } from '@/components/clip-panel/clip-artifact-panel';
import { ArrowLeft, Film, Sparkles, MessageSquare, Play, RefreshCw, Terminal } from 'lucide-react';

export default function ProjectChatPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || 'default-project';

  const [videos, setVideos] = useState<Video[]>([]);
  const [surfacedClips, setSurfacedClips] = useState<SourceMoment[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  useEffect(() => {
    const key = `clipscout_videos_${projectId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setVideos(JSON.parse(stored));
      } catch (e) {
        setVideos([]);
      }
    }
  }, [projectId]);

  const handleClipsSurfaced = (clips: SourceMoment[]) => {
    setSurfacedClips(clips);
    setActiveClipIndex(0);
  };

  const handleTimestampSeek = (timestampSec: number) => {
    const newMoment: SourceMoment = {
      video_id: videos[0]?.core_video_id || 'v0',
      chunk_id: 'seek_moment',
      start_s: timestampSec,
      end_s: timestampSec + 15,
      label: `Jumped to ${Math.floor(timestampSec / 60)}:${Math.floor(timestampSec % 60).toString().padStart(2, '0')}`,
    };
    setSurfacedClips((prev) => [newMoment, ...prev]);
    setActiveClipIndex(0);
  };

  return (
    <div className="h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col overflow-hidden font-sans">
      {/* Navigation Header */}
      <header className="h-14 border-b border-white/10 bg-black/80 backdrop-blur-2xl px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <Link
            href={`/projects/${projectId}`}
            className="p-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs text-white">Video Agent Chat</span>
            <span className="text-[10px] text-neutral-400 font-mono">({videos.length} videos indexed)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Link
            href={`/projects/${projectId}`}
            className="px-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition text-xs flex items-center gap-1"
          >
            <span>Workspace</span>
          </Link>
        </div>
      </header>

      {/* Main Chat & Clip Panel Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: AI Chat Feed */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
          <ChatPanel
            videos={videos}
            onClipsSurfaced={handleClipsSurfaced}
            onTimestampSeek={handleTimestampSeek}
          />
        </div>

        {/* Right: Clip Artifact Viewer Side Panel */}
        <div className="w-96 hidden lg:flex flex-col h-full shrink-0 border-l border-white/10 bg-neutral-950/80 backdrop-blur-xl">
          <ClipArtifactPanel
            clips={surfacedClips}
            activeClipIndex={activeClipIndex}
            onSelectClip={setActiveClipIndex}
          />
        </div>
      </div>
    </div>
  );
}
