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
      coreClient.getAnalyzers()
        .then((res) => {
          setAnalyzers(res.analyzers);
          // Set default selected
          const readyOnes = res.analyzers.filter(a => a.available).map(a => a.id);
          if (readyOnes.includes('transcript')) {
            setSelectedAnalyzers(['transcript']);
          } else if (readyOnes.length > 0) {
            setSelectedAnalyzers([readyOnes[0]]);
          }
        })
        .catch(() => {
          // Default fallback
          setAnalyzers([
            { id: 'transcript', label: 'Audio Transcription (Whisper)', requires: 'audio', available: true },
            { id: 'default_video', label: 'Visual Scene & Action (VLM)', requires: 'frames', available: true },
          ]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAnalyzer = (id: string) => {
    if (selectedAnalyzers.includes(id)) {
      setSelectedAnalyzers(selectedAnalyzers.filter(a => a !== id));
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
        if (!videoTitle) videoTitle = file.name.replace(/\.[^/.]+$/, "");
        
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
        source_url: tab === 'url' ? url.trim() : (file?.name || ''),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Ingest New Video</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'upload'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Video URL / YouTube</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Video Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Keynote Presentation 2026"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {tab === 'upload' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Video File</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40 relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">
                  {file ? file.name : 'Click or drag video file here'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">MP4, MOV, MKV, WebM up to 4GB</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Video URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          )}

          {/* Chunking Mode & Interval */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Chunking Mode</label>
              <select
                value={chunkingMode}
                onChange={(e) => setChunkingMode(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="fixed_interval">Fixed Interval</option>
                <option value="fused_signals">Fused Signals (Cuts + Audio)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Interval (seconds)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Analyzers Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Multimodal Analyzers</span>
              </label>
              <span className="text-[10px] text-slate-500">Fetched from Core API</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {analyzers.map((a) => (
                <label
                  key={a.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedAnalyzers.includes(a.id)
                      ? 'bg-indigo-950/40 border-indigo-800/80 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={selectedAnalyzers.includes(a.id)}
                      onChange={() => toggleAnalyzer(a.id)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                    />
                    <span>{a.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {a.requires}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center space-x-2"
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
