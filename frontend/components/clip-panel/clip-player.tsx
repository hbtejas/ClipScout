'use client';

import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ClipPlayerProps {
  src?: string;
  startTime?: number;
  endTime?: number;
  autoPlay?: boolean;
}

export function ClipPlayer({ src, startTime = 0, endTime, autoPlay = false }: ClipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && startTime !== undefined) {
      videoRef.current.currentTime = startTime;
      if (autoPlay) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [startTime, src, autoPlay]);

  const handleTimeUpdate = () => {
    if (videoRef.current && endTime && videoRef.current.currentTime >= endTime) {
      videoRef.current.pause();
    }
  };

  const jumpToStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime || 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 flex flex-col justify-center items-center">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          controls
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-center p-6 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <p className="text-xs text-slate-400">Select or seek a timestamp moment to play video clip</p>
        </div>
      )}
    </div>
  );
}
