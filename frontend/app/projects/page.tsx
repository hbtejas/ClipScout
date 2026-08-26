'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { Folder, Plus, ArrowRight, BookOpen, X } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('clipscout_projects');
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        setProjects([]);
      }
    } else {
      const defaultProject: Project = {
        id: 'demo-project-01',
        user_id: 'local-user',
        name: 'Default Workspace',
        description: 'Primary project for multimodal video analysis & RAG chat',
        created_at: new Date().toISOString(),
      };
      setProjects([defaultProject]);
      localStorage.setItem('clipscout_projects', JSON.stringify([defaultProject]));
    }
  }, []);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      id: crypto.randomUUID(),
      user_id: 'local-user',
      name: name.trim(),
      description: description.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('clipscout_projects', JSON.stringify(updated));
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-40 z-0" />

      {/* Top Nav */}
      <header className="relative z-20 border-b border-white/10 bg-black/70 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-xs shadow-lg">
              CS
            </div>
            <span className="font-semibold tracking-tight text-white text-sm">ClipScout</span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link href="/docs" className="text-neutral-400 hover:text-white transition flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </Link>
            <Link href="/login" className="text-neutral-400 hover:text-white transition">
              Sign In
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold transition shadow-lg shadow-white/10 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Projects</h1>
          <p className="text-sm text-neutral-400">
            Select a workspace to upload videos, run multimodal analysis, or open the AI agent chat.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-neutral-950/70 border border-white/10 hover:border-white/40 hover:bg-neutral-900/80 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between backdrop-blur-xl"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 font-medium">
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}

          {/* Create New Project Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-neutral-950/40 border border-dashed border-white/10 hover:border-white/30 hover:bg-neutral-900/60 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:scale-105 transition">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition">Create New Project</p>
              <p className="text-xs text-neutral-500 mt-0.5">Start a fresh workspace</p>
            </div>
          </button>
        </div>
      </main>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Create New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q3 Earnings & Investor Calls"
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this project's videos..."
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
