'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Sparkles, X, Loader2, Film } from 'lucide-react';
import { AnalyzerMeta } from '@/types';
import { coreClient } from '@/lib/core-client';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onVideoCreated: (video: any) => void;
}

export function UploadDialog({ isOpen, onClose, projectId, onVideoCreated }: UploadDialogProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [chunkingMode, setChunkingMode] = useState('fixed_interval');
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [analyzers, setAnalyzers] = useState<AnalyzerMeta[]>([]);
  const [selectedAnalyzers, setSelectedAnalyzers] = useState<string[]>(['transcript']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      coreClient
        .getAnalyzers()
        .then((res) => {
          setAnalyzers(res.analyzers);
          const readyOnes = res.analyzers.filter((a) => a.available).map((a) => a.id);
          if (readyOnes.includes('transcript')) {
            setSelectedAnalyzers(['transcript']);
          } else if (readyOnes.length > 0) {
            setSelectedAnalyzers([readyOnes[0]]);
          }
        })
        .catch(() => {
          setAnalyzers([
            { id: 'transcript', label: 'Audio Transcription (Whisper)', requires: 'audio', available: true },
            { id: 'default_video', label: 'Visual Scene & Action (VLM)', requires: 'frames', available: true },
            { id: 'people', label: 'People & Appearance (VLM)', requires: 'frames', available: true },
            { id: 'object_detection', label: 'Object Detection (YOLO Gate + VLM)', requires: 'frames', available: true },
            { id: 'ocr', label: 'On-Screen Text & OCR (VLM)', requires: 'frames', available: true },
          ]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAnalyzer = (id: string) => {
    if (selectedAnalyzers.includes(id)) {
      setSelectedAnalyzers(selectedAnalyzers.filter((a) => a !== id));
    } else {
      setSelectedAnalyzers([...selectedAnalyzers, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let coreRes;
      let videoTitle = title.trim();

      if (tab === 'upload') {
        if (!file) throw new Error('Please select a video file to upload');
        if (!videoTitle) videoTitle = file.name.replace(/\.[^/.]+$/, '');

        const fd = new FormData();
        fd.append('file', file);
        fd.append('analyzers', selectedAnalyzers.join(','));
        fd.append('chunking_mode', chunkingMode);
        fd.append('interval_s', String(intervalSeconds));

        coreRes = await coreClient.ingestFile(fd);
      } else {
        if (!url.trim()) throw new Error('Please enter a valid video URL');
        if (!videoTitle) videoTitle = 'Video from URL';

        coreRes = await coreClient.ingestUrl(
          url.trim(),
          selectedAnalyzers,
          chunkingMode,
          intervalSeconds
        );
      }

      const newVideo = {
        id: crypto.randomUUID(),
        project_id: projectId,
        core_video_id: coreRes.video_id,
        title: videoTitle,
        source_type: tab,
        source_url: tab === 'url' ? url.trim() : file?.name || '',
        status: 'queued',
        analysis_stage: 'chunking',
        analyzers_used: selectedAnalyzers,
        chunking_mode: chunkingMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onVideoCreated(newVideo);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to ingest video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 font-sans">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-white" />
            <h2 className="text-base font-semibold text-white tracking-tight">Ingest Video to Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/40">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'upload'
                ? 'border-white text-white bg-white/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'url'
                ? 'border-white text-white bg-white/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Video URL / YouTube</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">Video Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Earnings Presentation"
              className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
            />
          </div>

          {tab === 'upload' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">Select Video File</label>
              <div className="border-2 border-dashed border-white/10 hover:border-white/30 rounded-xl p-6 text-center cursor-pointer transition bg-black relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-7 h-7 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs text-neutral-200 font-medium">
                  {file ? file.name : 'Click or drag video file here'}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1">MP4, MOV, MKV, WebM up to 4GB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">Video URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                required
              />
            </div>
          )}

          {/* Chunking Mode & Interval */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">Chunking Mode</label>
              <select
                value={chunkingMode}
                onChange={(e) => setChunkingMode(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition"
              >
                <option value="fixed_interval">Fixed Interval</option>
                <option value="fused_signals">Fused Signals (Cuts + Audio)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">Interval (seconds)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition"
              />
            </div>
          </div>

          {/* Analyzers Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Multimodal Analyzers</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">Qdrant Vector Indexing</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {analyzers.map((a) => (
                <label
                  key={a.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedAnalyzers.includes(a.id)
                      ? 'bg-neutral-900 border-white/30 text-white'
                      : 'bg-black border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={selectedAnalyzers.includes(a.id)}
                      onChange={() => toggleAnalyzer(a.id)}
                      className="rounded border-white/20 text-white focus:ring-0 bg-black"
                    />
                    <span>{a.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-white/10">
                    {a.requires}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition shadow-lg shadow-white/10 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Start Ingestion</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
