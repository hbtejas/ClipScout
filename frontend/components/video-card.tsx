'use client';

import React, { useEffect, useState } from 'react';
import { Video } from '@/types';
import { coreClient, VideoStatusResponse } from '@/lib/core-client';
import { Film, CheckCircle2, AlertCircle, Clock, Loader2, Sparkles, Layers, Terminal } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewTranscript?: () => void;
}

export function VideoCard({ video, isSelected, onSelect, onViewTranscript }: VideoCardProps) {
  const [statusState, setStatusState] = useState<VideoStatusResponse | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      try {
        const res = await coreClient.getVideoStatus(video.core_video_id);
        setStatusState(res);
        if (res.status === 'ready' || res.status === 'failed') {
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        // Core video not yet found or offline
      }
    };

    checkStatus();

    // Poll if not ready/failed
    if (video.status !== 'ready' && video.status !== 'failed') {
      interval = setInterval(checkStatus, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [video.core_video_id, video.status]);

  const currentStatus = statusState?.status || video.status;
  const currentStage = statusState?.analysis_stage || video.analysis_stage || 'queued';
  const progress = statusState?.progress || 0;
  const duration = statusState?.duration_seconds || video.duration_seconds || 0;

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer backdrop-blur-xl ${
        isSelected
          ? 'bg-neutral-900/90 border-white shadow-2xl'
          : 'bg-neutral-950/70 border-white/10 hover:border-white/30 hover:bg-neutral-900/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
              {video.title}
            </h3>
            <p className="text-[10px] text-neutral-400 font-mono">
              ID: {video.core_video_id}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {currentStatus === 'ready' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
              <CheckCircle2 className="w-3 h-3" />
              READY
            </span>
          )}
          {currentStatus === 'analyzing' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-neutral-300 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              {currentStage.toUpperCase()}
            </span>
          )}
          {currentStatus === 'queued' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400">
              <Clock className="w-3 h-3" />
              QUEUED
            </span>
          )}
          {currentStatus === 'failed' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300">
              <AlertCircle className="w-3 h-3" />
              FAILED
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar during analysis */}
      {currentStatus === 'analyzing' && (
        <div className="mt-4 space-y-1.5 font-mono text-[10px]">
          <div className="flex justify-between text-neutral-400">
            <span>Analyzing: {currentStage}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
            <div
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-400">
        {duration > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black border border-white/10 text-neutral-300">
            <Clock className="w-3 h-3 text-neutral-400" />
            {formatDuration(duration)}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black border border-white/10 text-neutral-300 uppercase">
          <Layers className="w-3 h-3 text-neutral-400" />
          {video.chunking_mode.replace('_', ' ')}
        </span>
        {statusState?.num_chunks ? (
          <span className="px-2 py-0.5 rounded-md bg-black border border-white/10 text-neutral-300">
            {statusState.num_chunks} chunks
          </span>
        ) : null}
      </div>

      {/* Action Footer */}
      {currentStatus === 'ready' && onViewTranscript && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewTranscript();
            }}
            className="text-[11px] font-mono text-neutral-300 hover:text-white transition flex items-center gap-1"
          >
            <span>Inspect Transcript Segments</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
