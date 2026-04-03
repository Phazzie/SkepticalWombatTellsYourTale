'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    const project = await res.json();
    setProjects((prev) => [project, ...prev]);
    setNewName('');
    setNewDesc('');
    setShowNew(false);
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">SkepticalWombat</h1>
          <p className="text-gray-400 text-lg">Tell Your Tale. The AI that makes your thinking harder.</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-200">Your Projects</h2>
          <button
            onClick={() => setShowNew(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Project
          </button>
        </div>

        {showNew && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">New Project</h3>
            <input
              type="text"
              placeholder="Project name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              autoFocus
            />
            <textarea
              placeholder="What is this project? (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={createProject}
                disabled={creating || !newName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">🎙️</div>
            <p className="text-xl mb-2">No projects yet</p>
            <p className="text-gray-600">Create your first project to start talking.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="block bg-gray-900 border border-gray-700 hover:border-indigo-500 rounded-xl p-6 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-400 mt-1 text-sm">{project.description}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-2">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-gray-600 group-hover:text-indigo-400 transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
