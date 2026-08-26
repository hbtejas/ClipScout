'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Video, SearchResultItem } from '@/types';
import { VideoCard } from '@/components/video-card';
import { UploadDialog } from '@/components/upload-dialog';
import { coreClient, TranscriptResponse } from '@/lib/core-client';
import { Film, Plus, Search, MessageSquare, ArrowLeft, Clock, Sparkles, X, Layers, Play, Zap, Terminal } from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || 'default-project';

  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Direct Semantic Moment Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Transcript Inspector Modal
  const [inspectingVideoId, setInspectingVideoId] = useState<string | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

  useEffect(() => {
    // Load project videos from local storage
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

  const handleVideoCreated = (newVideo: Video) => {
    const updated = [newVideo, ...videos];
    setVideos(updated);
    localStorage.setItem(`clipscout_videos_${projectId}`, JSON.stringify(updated));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const readyVideoIds = videos.filter((v) => v.status === 'ready').map((v) => v.core_video_id);
      const res = await coreClient.search({
        query: searchQuery.trim(),
        video_ids: readyVideoIds.length > 0 ? readyVideoIds : undefined,
        top_k: 6,
      });
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const openTranscriptInspector = async (coreVideoId: string) => {
    setInspectingVideoId(coreVideoId);
    setIsLoadingTranscript(true);
    try {
      const data = await coreClient.getTranscript(coreVideoId);
      setTranscriptData(data);
    } catch (err) {
      console.error('Failed to fetch transcript:', err);
      setTranscriptData(null);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const readyVideosCount = videos.filter((v) => v.status === 'ready').length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-40" />

      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-2xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/projects"
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-xs shadow-md">
                PW
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight">Project Workspace</h1>
                <p className="text-[10px] text-neutral-400 font-mono">ID: {projectId}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-white font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Ingest Video</span>
            </button>

            <Link
              href={`/projects/${projectId}/chat`}
              className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold transition shadow-lg shadow-white/10 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open AI Chat ({readyVideosCount})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Semantic Moment Search Box */}
        <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-white" />
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                Direct Semantic Moment Search
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Local Qdrant Dense Vector Index</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search moments by speech or visual descriptions (e.g. 'quarterly revenue', 'product architecture')..."
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition disabled:opacity-40"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Hits */}
          {searchResults.length > 0 && (
            <div className="pt-3 space-y-3 border-t border-white/10">
              <div className="text-[11px] font-mono text-neutral-400">
                Top Matches ({searchResults.length}):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((hit, idx) => (
                  <div
                    key={`${hit.video_id}_${hit.chunk_id}_${idx}`}
                    onClick={() => openTranscriptInspector(hit.video_id)}
                    className="p-4 rounded-xl bg-black border border-white/10 hover:border-white/40 cursor-pointer transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                        ⏱️ {hit.formatted_start || `${Math.floor(hit.start_s / 60)}:${Math.floor(hit.start_s % 60).toString().padStart(2, '0')}`} –{' '}
                        {hit.formatted_end || `${Math.floor(hit.end_s / 60)}:${Math.floor(hit.end_s % 60).toString().padStart(2, '0')}`}
                      </span>
                      <span className="text-neutral-400">Score: {hit.score}</span>
                    </div>
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {hit.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Indexed Videos</h2>
              <p className="text-xs text-neutral-400">
                Manage footage in this project. Ready videos are queryable in search and AI agent tools.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Total: {videos.length} video{videos.length !== 1 ? 's' : ''}
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="p-16 rounded-3xl bg-neutral-950/60 border border-dashed border-white/10 text-center space-y-4 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                <Film className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-white">No videos in this workspace yet</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Upload a video file or paste a video URL to initiate chunking, transcription, and vector indexing.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition shadow-lg shadow-white/10 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Video</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isSelected={selectedVideo?.id === video.id}
                  onSelect={() => setSelectedVideo(video)}
                  onViewTranscript={() => openTranscriptInspector(video.core_video_id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Ingest Modal */}
      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        projectId={projectId}
        onVideoCreated={handleVideoCreated}
      />

      {/* Transcript Inspector Modal */}
      {inspectingVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Transcript Segments</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">Video ID: {inspectingVideoId}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingVideoId(null)}
                className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {isLoadingTranscript ? (
                <p className="text-xs text-neutral-400 py-8 text-center">Loading transcript segments...</p>
              ) : transcriptData?.segments && transcriptData.segments.length > 0 ? (
                transcriptData.segments.map((seg, idx) => {
                  const m1 = Math.floor(seg.start / 60);
                  const s1 = Math.floor(seg.start % 60).toString().padStart(2, '0');
                  const m2 = Math.floor(seg.end / 60);
                  const s2 = Math.floor(seg.end % 60).toString().padStart(2, '0');
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-black border border-white/10 text-xs">
                      <span className="font-mono text-white font-semibold mr-2">
                        [{m1}:{s1} - {m2}:{s2}]
                      </span>
                      <span className="text-neutral-300">{seg.text}</span>
                    </div>
                  );
                })
              ) : transcriptData?.full_text ? (
                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {transcriptData.full_text}
                </p>
              ) : (
                <p className="text-xs text-neutral-400 py-8 text-center">
                  No transcript generated yet or video is still analyzing.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
