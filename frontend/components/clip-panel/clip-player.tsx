'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Rewind, Maximize2 } from 'lucide-react';

interface ClipPlayerProps {
  src?: string;
  startTime?: number;
  endTime?: number;
  autoPlay?: boolean;
}

export function ClipPlayer({ src, startTime = 0, endTime, autoPlay = false }: ClipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Fallback demo video for instant browser preview if no video uploaded yet
  const effectiveSrc =
    src ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    if (videoRef.current && startTime !== undefined) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
      if (autoPlay) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [startTime, src, autoPlay]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      if (endTime && curr >= endTime) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (endTime && videoRef.current.currentTime >= endTime) {
          videoRef.current.currentTime = startTime || 0;
        }
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, seconds));
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 flex flex-col justify-between shadow-2xl group">
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={effectiveSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          muted={isMuted}
          playsInline
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition scale-100 hover:scale-110 shadow-2xl"
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-3 bg-neutral-950/90 border-t border-white/10 space-y-2">
        {/* Timeline Scrubber */}
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
          <div
            className="absolute top-0 bottom-0 left-0 bg-white transition-all rounded-full"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => seek(currentTime - 5)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition"
              title="Rewind 5s"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => seek(currentTime + 5)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition"
              title="Forward 5s"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-neutral-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cycleSpeed}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[10px] text-neutral-300 hover:text-white transition"
            >
              {playbackRate}x
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
