'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Document } from '@/lib/types';
import { requestJson } from '@/lib/client/request';

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [driftFeedback, setDriftFeedback] = useState<{ hasDrift: boolean; details: string; rewriteSuggestion?: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    requestJson<Document[]>(`/api/projects/${id}/documents`)
      .then(({ data }) => {
        setDocuments(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const createDocument = async () => {
    if (!newName.trim()) return;
    setActionError(null);
    try {
      const res = await requestJson<Document>(`/api/projects/${id}/documents`, {
        method: 'POST',
        body: { name: newName, type: newType },
      });
      const createdDocument = res.data;
      if (!res.ok || !createdDocument) {
        setActionError(`Failed to create document (${res.status})`);
        return;
      }
      setDocuments((prev) => [...prev, createdDocument]);
      setNewName('');
      setShowNew(false);
    } catch {
      setActionError('Failed to create document');
    }
  };

  const saveDocument = async (docId: string) => {
    setSaving(true);
    setActionError(null);
    try {
      const response = await requestJson(`/api/projects/${id}/documents/${docId}`, {
        method: 'PATCH',
        body: { content: editContent },
      });
      if (!response.ok) {
        setActionError(`Failed to save document (${response.status})`);
        return;
      }
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, content: editContent } : d))
      );
      setEditingId(null);
    } catch {
      setActionError('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const generateDraft = async (docId: string) => {
    if (!voicePrompt.trim()) return;
    setGeneratingDraft(true);
    setDriftFeedback(null);
    setActionError(null);
    try {
      const res = await requestJson<{ draft?: string; drift?: { hasDrift: boolean; details: string; rewriteSuggestion?: string } }>(
        `/api/projects/${id}/voice-draft`,
        {
          method: 'POST',
          body: { documentId: docId, prompt: voicePrompt },
        }
      );
      if (!res.ok) {
        setActionError(`Failed to generate draft (${res.status})`);
        return;
      }
      if (!res.data || !res.data.draft) {
        setActionError('Failed to generate draft content');
        return;
      }
      const { draft, drift } = res.data;
      const doc = documents.find((d) => d.id === docId);
      if (doc) {
        const newContent = doc.content ? `${doc.content}\n\n---\n\n${draft}` : draft;
        setEditContent(newContent);
      }
      if (drift) setDriftFeedback(drift);
      setVoicePrompt('');
    } catch {
      setActionError('Failed to generate draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const documentTypes = ['general', 'stories', 'concepts', 'structure', 'characters', 'unfinished', 'chapters'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/project/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Documents</h1>
          <button
            onClick={() => setShowNew(true)}
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Document
          </button>
        </div>
        {actionError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 rounded-xl border border-red-700 bg-red-900/20 p-4 text-sm text-red-300"
          >
            {actionError}
          </div>
        )}

        {showNew && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
            <h3 className="font-semibold mb-3">New Document</h3>
            <input
              type="text"
              placeholder="Document name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-indigo-500"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={createDocument} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">
                Create
              </button>
              <button onClick={() => setShowNew(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📄</div>
            <p>No documents yet. Create your first working document.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                  <div>
                    <span className="font-semibold text-white">{doc.name}</span>
                    <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{doc.type}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(editingId === doc.id ? null : doc.id);
                      setEditContent(doc.content);
                    }}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    {editingId === doc.id ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editingId === doc.id ? (
                  <div className="p-5">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
                      placeholder="Document content..."
                    />
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <p className="text-xs text-green-400 mb-2">✍️ Generate in your voice</p>
                      <input
                        type="text"
                        placeholder="What do you want written? (e.g., 'the story about my father')"
                        value={voicePrompt}
                        onChange={(e) => setVoicePrompt(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none mb-2"
                      />
                      <button
                        onClick={() => generateDraft(doc.id)}
                        disabled={generatingDraft || !voicePrompt.trim()}
                        className="text-xs bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-1.5 rounded"
                      >
                        {generatingDraft ? 'Writing in your voice...' : 'Generate Draft'}
                      </button>
                      {driftFeedback && (
                        <div
                          className={`mt-3 border rounded p-3 text-xs ${
                            driftFeedback.hasDrift
                              ? 'border-amber-700 bg-amber-900/20 text-amber-300'
                              : 'border-green-700 bg-green-900/20 text-green-300'
                          }`}
                        >
                          <p>{driftFeedback.hasDrift ? 'Voice drift detected.' : 'Voice match looks strong.'}</p>
                          {driftFeedback.details && <p className="mt-1 text-gray-300">{driftFeedback.details}</p>}
                          {driftFeedback.rewriteSuggestion && (
                            <p className="mt-1 text-gray-400">Suggestion: {driftFeedback.rewriteSuggestion}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => saveDocument(doc.id)}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium text-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    {doc.content ? (
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                        {doc.content}
                      </p>
                    ) : (
                      <p className="text-gray-600 text-sm italic">Empty document</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
