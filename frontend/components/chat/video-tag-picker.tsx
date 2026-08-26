'use client';

import React, { useState } from 'react';
import { Video } from '@/types';
import { Tag, Check, ChevronDown, Film } from 'lucide-react';

interface VideoTagPickerProps {
  videos: Video[];
  selectedVideoIds: string[];
  onChange: (ids: string[]) => void;
}

export function VideoTagPicker({ videos, selectedVideoIds, onChange }: VideoTagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVideo = (id: string) => {
    if (selectedVideoIds.includes(id)) {
      onChange(selectedVideoIds.filter((v) => v !== id));
    } else {
      onChange([...selectedVideoIds, id]);
    }
  };

  const readyVideos = videos.filter((v) => v.status === 'ready');

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
      >
        <Film className="w-3.5 h-3.5 text-indigo-400" />
        <span>
          {selectedVideoIds.length === 0
            ? 'All Ready Videos'
            : `${selectedVideoIds.length} video${selectedVideoIds.length > 1 ? 's' : ''} tagged`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 bottom-full mb-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-30 p-2 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
              Select Videos for Conversation
            </div>
            {readyVideos.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-2">No ready videos found</p>
            ) : (
              readyVideos.map((v) => {
                const isSelected = selectedVideoIds.includes(v.core_video_id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleVideo(v.core_video_id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition ${
                      isSelected
                        ? 'bg-indigo-950/60 text-indigo-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate pr-2">{v.title}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
