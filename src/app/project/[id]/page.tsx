'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Project, Tangent, Gap, Pattern } from '@/lib/types';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ kind: string; id: string; title: string; snippet: string }>>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}?include=all`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const resolveTangent = async (tangentId: string) => {
    await fetch(`/api/projects/${id}/tangents/${tangentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    setProject((prev) =>
      prev
        ? {
            ...prev,
            tangents: prev.tangents?.map((t) =>
              t.id === tangentId ? { ...t, status: 'resolved' as const } : t
            ),
          }
        : prev
    );
  };

  const resolveGap = async (gapId: string) => {
    await fetch(`/api/projects/${id}/gaps/${gapId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true }),
    });
    setProject((prev) =>
      prev
        ? {
            ...prev,
            gaps: prev.gaps?.map((g) =>
              g.id === gapId ? { ...g, resolved: true } : g
            ),
          }
        : prev
    );
  };

  const updateConcept = async (conceptId: string, approved: boolean) => {
    await fetch(`/api/projects/${id}/concepts`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptId, approved, status: approved ? 'complete' : 'developing' }),
    });
    setProject((prev) =>
      prev
        ? {
            ...prev,
            concepts: prev.concepts?.map((c) =>
              c.id === conceptId ? { ...c, approved, status: approved ? 'complete' : c.status } : c
            ),
          }
        : prev
    );
  };

  const updateContradiction = async (contradictionId: string, status: 'open' | 'explored' | 'dismissed') => {
    await fetch(`/api/projects/${id}/contradictions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contradictionId, status }),
    });
    setProject((prev) =>
      prev
        ? {
            ...prev,
            contradictions: prev.contradictions?.map((c) =>
              c.id === contradictionId ? { ...c, status } : c
            ),
          }
        : prev
    );
  };

  const searchProject = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/projects/${id}/search?q=${encodeURIComponent(searchTerm)}`);
    const data = await res.json();
    setSearchResults(data.results || []);
    setSearching(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Project not found</div>
      </div>
    );
  }

  const pendingTangents = project.tangents?.filter((t) => t.status === 'pending') || [];
  const openGaps = project.gaps?.filter((g) => !g.resolved) || [];
  const newPatterns = project.patterns?.filter((p) => !p.acknowledged) || [];
  const pendingQuestions = project.questions?.filter((q) => q.status === 'pending') || [];
  const pendingConcepts = project.concepts?.filter((c) => !c.approved) || [];
  const openContradictions = project.contradictions?.filter((c) => c.status === 'open') || [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
            ← Projects
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            {project.description && <p className="text-gray-400 mt-1">{project.description}</p>}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/project/${id}/record`}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl p-5 text-center transition-colors"
          >
            <div className="text-3xl mb-2">🎙️</div>
            <div className="font-semibold">Record</div>
            <div className="text-indigo-300 text-xs mt-1">Voice session</div>
          </Link>
          <Link
            href={`/project/${id}/documents`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-5 text-center transition-colors"
          >
            <div className="text-3xl mb-2">📄</div>
            <div className="font-semibold">Documents</div>
            <div className="text-gray-400 text-xs mt-1">{project.documents?.length || 0} docs</div>
          </Link>
          <Link
            href={`/project/${id}/sessions`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-5 text-center transition-colors"
          >
            <div className="text-3xl mb-2">📼</div>
            <div className="font-semibold">Sessions</div>
            <div className="text-gray-400 text-xs mt-1">{project.sessions?.length || 0} sessions</div>
          </Link>
          <Link
            href={`/project/${id}/export`}
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-5 text-center transition-colors"
          >
            <div className="text-3xl mb-2">📤</div>
            <div className="font-semibold">Export</div>
            <div className="text-gray-400 text-xs mt-1">Export work</div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tangent Tracker */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🧵</span>
              <h2 className="font-semibold text-white">Dropped Threads</h2>
              {pendingTangents.length > 0 && (
                <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {pendingTangents.length}
                </span>
              )}
            </div>
            {pendingTangents.length === 0 ? (
              <p className="text-gray-500 text-sm">No dropped threads yet.</p>
            ) : (
              <div className="space-y-3">
                {pendingTangents.slice(0, 5).map((tangent: Tangent) => (
                  <div key={tangent.id} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-amber-400 font-medium">{tangent.thread}</p>
                    {tangent.context && (
                      <p className="text-xs text-gray-500 mt-1 italic">&quot;{tangent.context}&quot;</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => resolveTangent(tangent.id)}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        ✓ Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gap Detection */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔍</span>
              <h2 className="font-semibold text-white">Gaps</h2>
              {openGaps.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {openGaps.length}
                </span>
              )}
            </div>
            {openGaps.length === 0 ? (
              <p className="text-gray-500 text-sm">No gaps detected yet. Add more sessions.</p>
            ) : (
              <div className="space-y-3">
                {openGaps.slice(0, 5).map((gap: Gap) => (
                  <div key={gap.id} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-red-400">{gap.description}</p>
                    {gap.documentRef && (
                      <p className="text-xs text-gray-500 mt-1">In: {gap.documentRef}</p>
                    )}
                    <button
                      onClick={() => resolveGap(gap.id)}
                      className="text-xs text-green-400 hover:text-green-300 mt-2"
                    >
                      ✓ Resolved
                    </button>
                  </div>
                ))}
                {openGaps.length > 5 && (
                  <p className="text-xs text-gray-500">+{openGaps.length - 5} more gaps</p>
                )}
              </div>
            )}
          </div>

          {/* Patterns */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔁</span>
              <h2 className="font-semibold text-white">Patterns</h2>
              {newPatterns.length > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {newPatterns.length}
                </span>
              )}
            </div>
            {newPatterns.length === 0 ? (
              <p className="text-gray-500 text-sm">No patterns detected yet.</p>
            ) : (
              <div className="space-y-3">
                {newPatterns.slice(0, 5).map((pattern: Pattern) => (
                  <div key={pattern.id} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-purple-400">{pattern.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Seen in {pattern.sessionRefs.length} session(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">❓</span>
            <h2 className="font-semibold text-white">Questions for You</h2>
          </div>
          <Link
            href={`/project/${id}/questions`}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            View all questions and prompts →
          </Link>
          <p className="text-gray-500 text-xs mt-2">{pendingQuestions.length} pending</p>
        </div>

        {/* Concept Library + Contradictions */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏷️</span>
              <h2 className="font-semibold text-white">Concept Candidates</h2>
            </div>
            {pendingConcepts.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending concept names.</p>
            ) : (
              <div className="space-y-3">
                {pendingConcepts.slice(0, 5).map((concept) => (
                  <div key={concept.id} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-green-300 font-medium">{concept.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{concept.definition}</p>
                    <button
                      onClick={() => updateConcept(concept.id, true)}
                      className="text-xs text-green-400 hover:text-green-300 mt-2"
                    >
                      ✓ Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚖️</span>
              <h2 className="font-semibold text-white">Open Contradictions</h2>
            </div>
            {openContradictions.length === 0 ? (
              <p className="text-gray-500 text-sm">No unresolved contradictions.</p>
            ) : (
              <div className="space-y-3">
                {openContradictions.slice(0, 5).map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-red-300">{item.description}</p>
                    <button
                      onClick={() => updateContradiction(item.id, 'explored')}
                      className="text-xs text-green-400 hover:text-green-300 mt-2"
                    >
                      ✓ Mark explored
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔎</span>
            <h2 className="font-semibold text-white">Search Across Everything</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchProject()}
              placeholder="Search sessions, docs, concepts, questions..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500"
            />
            <button
              onClick={searchProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.slice(0, 10).map((r) => (
                <div key={`${r.kind}:${r.id}`} className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-500 uppercase">{r.kind}</p>
                  <p className="text-sm text-gray-200">{r.title}</p>
                  {r.snippet && <p className="text-xs text-gray-400 mt-1">{r.snippet}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
