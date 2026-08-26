'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { Video, SourceMoment } from '@/types';
import { ChatMessage } from './message';
import { VideoTagPicker } from './video-tag-picker';
import { ModelPicker } from './model-picker';
import { Send, Sparkles, Film, ArrowRight, CornerDownLeft, Zap } from 'lucide-react';

interface ChatPanelProps {
  videos: Video[];
  onClipsSurfaced?: (clips: SourceMoment[]) => void;
  onTimestampSeek?: (timestampSec: number) => void;
}

export function ChatPanel({ videos, onClipsSurfaced, onTimestampSeek }: ChatPanelProps) {
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(
    videos.filter(v => v.status === 'ready').map(v => v.core_video_id)
  );
  const [selectedModel, setSelectedModel] = useState('openai:gpt-4o-mini');

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
    body: {
      video_ids: selectedVideoIds,
      model: selectedModel,
    },
    onToolCall({ toolCall }) {
      if (toolCall.toolName === 'show_clips') {
        const args = toolCall.args as any;
        if (args.clips && onClipsSurfaced) {
          onClipsSurfaced(args.clips);
        }
      }
    },
  });

  const quickPrompts = [
    "What is the main topic discussed in this video?",
    "Show me moments with key demonstrations",
    "Who are the people speaking or present?",
    "Summarize what happens step by step",
  ];

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="flex items-center space-x-2">
          <VideoTagPicker
            videos={videos}
            selectedVideoIds={selectedVideoIds}
            onChange={setSelectedVideoIds}
          />
        </div>
        <ModelPicker selectedModel={selectedModel} onChange={setSelectedModel} />
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl shadow-white/5">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Ask anything about your indexed videos
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ClipScout searches visual scenes and transcripts simultaneously, synthesizing answers citing exact timecodes.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt } } as any);
                  }}
                  className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 hover:border-white/40 hover:bg-neutral-900 text-left text-xs text-neutral-300 transition group"
                >
                  <p className="line-clamp-2 leading-relaxed">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role as any}
              content={m.content}
              toolInvocations={m.toolInvocations}
              onTimestampClick={onTimestampSeek}
            />
          ))
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Ask a question or search for video moments..."
            rows={2}
            className="w-full bg-black border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white resize-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 bottom-3 p-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
