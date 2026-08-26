'use client';

import React from 'react';
import { Bot, User, Wrench, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface MessageProps {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolInvocations?: any[];
  onTimestampClick?: (timestampSec: number) => void;
}

export function ChatMessage({ role, content, toolInvocations, onTimestampClick }: MessageProps) {
  const isUser = role === 'user';

  // Highlight timestamps (e.g. 1:23 or 01:23) into clickable pills
  const renderFormattedContent = (text: string) => {
    const timestampRegex = /\b(\d{1,2}:\d{2})\b/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const timeStr = match[1];
      const [m, s] = timeStr.split(':').map(Number);
      const totalSec = m * 60 + s;

      parts.push(
        <button
          key={`${match.index}-${timeStr}`}
          type="button"
          onClick={() => onTimestampClick?.(totalSec)}
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-full bg-white/10 text-white font-mono text-[10px] font-semibold border border-white/20 hover:bg-white hover:text-black transition cursor-pointer group"
          title={`Jump video to ${timeStr}`}
        >
          <Clock className="w-2.5 h-2.5 group-hover:rotate-45 transition" />
          <span>{timeStr}</span>
        </button>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg shadow-white/5">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Tool execution indicators */}
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="space-y-1">
            {toolInvocations.map((tool, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-white/10 text-[11px] text-neutral-400 font-mono"
              >
                <Wrench className="w-3 h-3 text-white animate-spin" />
                <span>Tool: <strong className="text-white">{tool.toolName}</strong></span>
              </div>
            ))}
          </div>
        )}

        {/* Bubble */}
        {content && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
              isUser
                ? 'bg-white text-black font-medium shadow-xl rounded-tr-sm'
                : 'bg-neutral-950/90 border border-white/10 text-neutral-200 shadow-2xl backdrop-blur-xl rounded-tl-sm'
            }`}
          >
            <div className="whitespace-pre-wrap">{renderFormattedContent(content)}</div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-white shrink-0">
          <User className="w-4 h-4 text-neutral-400" />
        </div>
      )}
    </div>
  );
}
