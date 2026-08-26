'use client';

import React from 'react';
import { Bot, User, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';

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
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-500/40 hover:bg-indigo-500/30 transition cursor-pointer"
        >
          ⏱️ {timeStr}
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
    <div className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`space-y-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Tool execution indicators */}
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="space-y-1">
            {toolInvocations.map((tool, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-mono"
              >
                <Wrench className="w-3 h-3 text-indigo-400 animate-spin" />
                <span>Calling: {tool.toolName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bubble */}
        {content && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
              isUser
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 rounded-tr-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-lg rounded-tl-sm'
            }`}
          >
            <div className="whitespace-pre-wrap">{renderFormattedContent(content)}</div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
