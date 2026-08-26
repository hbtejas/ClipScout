'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

interface ModelPickerProps {
  selectedModel: string;
  onChange: (model: string) => void;
}

export function ModelPicker({ selectedModel, onChange }: ModelPickerProps) {
  const models = [
    { id: 'openai:gpt-4o-mini', label: 'GPT-4o Mini (Fast & Grounded)' },
    { id: 'openai:gpt-4o', label: 'GPT-4o (High Intelligence)' },
    { id: 'google:gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { id: 'cerebras:llama-3.3-70b', label: 'Cerebras Llama 3.3 70B' },
  ];

  return (
    <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
      <Cpu className="w-3.5 h-3.5 text-violet-400" />
      <select
        value={selectedModel}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
