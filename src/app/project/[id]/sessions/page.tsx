'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Session, AIAnnotation } from '@/lib/types';

export default function SessionsPage() {
  const { id } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}/sessions`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const annotationColors: Record<string, string> = {
    important: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    connection: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    unfinished: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
    tangent: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    pattern: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  };

  const annotationIcons: Record<string, string> = {
    important: '⚡',
    connection: '🔗',
    unfinished: '🧵',
    tangent: '↪️',
    pattern: '🔁',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/project/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Sessions</h1>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📼</div>
            <p>No sessions yet.</p>
            <Link href={`/project/${id}/record`} className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
              Record your first session →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const annotations: AIAnnotation[] = Array.isArray(session.aiAnnotations)
                ? session.aiAnnotations
                : [];

              return (
                <div key={session.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-white">
                        Session — {new Date(session.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {session.transcript.slice(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {annotations.length > 0 && (
                        <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                          {annotations.length} annotations
                        </span>
                      )}
                      <span className="text-gray-500">{expandedId === session.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expandedId === session.id && (
                    <div className="border-t border-gray-700">
                      <div className="px-5 py-4">
                        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                          Raw Transcript
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {session.transcript}
                        </p>
                      </div>

                      {annotations.length > 0 && (
                        <div className="border-t border-gray-700 px-5 py-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <span>🤖</span> AI Coach Notes
                          </h3>
                          <div className="space-y-2">
                            {annotations.map((ann, i) => (
                              <div
                                key={i}
                                className={`border rounded-lg px-3 py-2 text-sm ${
                                  annotationColors[ann.type] || 'bg-gray-800 border-gray-600 text-gray-300'
                                }`}
                              >
                                <span className="mr-2">{annotationIcons[ann.type] || '💡'}</span>
                                {ann.text}
                                {ann.reference && (
                                  <span className="ml-2 text-xs opacity-70">({ann.reference})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
