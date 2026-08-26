'use client';

import React, { useState } from 'react';
import { SourceMoment } from '@/types';
import { ClipPlayer } from './clip-player';
import { Play, SkipForward, Film, Clock, Sparkles, Zap } from 'lucide-react';

interface ClipArtifactPanelProps {
  clips: SourceMoment[];
  activeClipIndex?: number;
  onSelectClip?: (index: number) => void;
  videoSourceUrl?: string;
}

export function ClipArtifactPanel({
  clips = [],
  activeClipIndex = 0,
  onSelectClip,
  videoSourceUrl,
}: ClipArtifactPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(activeClipIndex);
  const activeClip = clips[currentIndex] || clips[0];

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleClipClick = (idx: number) => {
    setCurrentIndex(idx);
    if (onSelectClip) onSelectClip(idx);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/80 border-l border-white/10 p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Film className="w-4 h-4 text-white" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
            Clip Artifact Viewer
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
          {clips.length} moments
        </span>
      </div>

      {/* Video Player */}
      <ClipPlayer
        src={videoSourceUrl}
        startTime={activeClip?.start_s || 0}
        endTime={activeClip?.end_s}
        autoPlay={true}
      />

      {/* Clip List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="text-[11px] font-mono text-neutral-400 px-1">Retrieved Video Evidence</div>
        {clips.length === 0 ? (
          <div className="p-6 rounded-xl bg-black/60 border border-white/10 text-center text-xs text-neutral-500">
            No clips surfaced yet. Ask the assistant to find or show video moments.
          </div>
        ) : (
          clips.map((clip, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={`${clip.video_id}_${clip.chunk_id}_${idx}`}
                onClick={() => handleClipClick(idx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  isSelected
                    ? 'bg-neutral-900 border-white shadow-xl'
                    : 'bg-black border-white/10 hover:border-white/30 hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-semibold text-white px-2 py-0.5 rounded bg-white/10 border border-white/20">
                    {formatTimestamp(clip.start_s)} – {formatTimestamp(clip.end_s)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Chunk #{clip.chunk_id.split('_c').pop() || clip.chunk_id}
                  </span>
                </div>
                <p className="text-neutral-300 text-[11px] line-clamp-2 leading-relaxed">
                  {clip.label || 'Timestamped video moment'}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
