'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage, TextArea, TextInput } from '@/components/ui/primitives';
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
      <Shell>
        <Container wide>
          <StatusMessage state="loading" title="Loading documents..." />
        </Container>
      </Shell>
    );
  }

  return (
    <Shell>
      <Container wide>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader
          title="Documents"
          actions={<PrimaryButton onClick={() => setShowNew(true)}>+ New Document</PrimaryButton>}
        />
        {actionError && (
          <div role="alert" aria-live="assertive" className="mb-6">
            <StatusMessage state="error" title={actionError} />
          </div>
        )}

        {showNew && (
          <Card className="mb-6">
            <h3 className="mb-3 font-semibold text-app-fg">New Document</h3>
            <TextInput
              type="text"
              placeholder="Document name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mb-3"
              autoFocus
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="mb-4 w-full rounded-xl border border-app-border bg-app-surface-muted px-4 py-2.5 text-sm text-app-fg transition focus-visible:border-neon-lime/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <PrimaryButton onClick={createDocument} className="px-6">
                Create
              </PrimaryButton>
              <SecondaryButton onClick={() => setShowNew(false)} className="px-6">
                Cancel
              </SecondaryButton>
            </div>
          </Card>
        )}

        {documents.length === 0 ? (
          <StatusMessage state="empty" title="No documents yet." description="Create your first working document." />
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden p-0">
                <div className="flex items-center justify-between gap-3 border-b border-app-border px-5 py-4">
                  <div>
                    <span className="font-semibold text-app-fg">{doc.name}</span>
                    <span className="ml-2 rounded bg-app-surface-muted px-2 py-0.5 text-xs text-app-fg-muted">{doc.type}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(editingId === doc.id ? null : doc.id);
                      setEditContent(doc.content);
                    }}
                    className="text-sm text-neon-lime transition hover:text-neon-lime/80"
                  >
                    {editingId === doc.id ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editingId === doc.id ? (
                  <div className="p-5">
                    <TextArea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="resize-none font-mono"
                      placeholder="Document content..."
                    />
                    <div className="mt-4 rounded-xl border border-app-border bg-app-surface-muted p-4">
                      <p className="mb-2 text-xs text-neon-lime">✍️ Generate in your voice</p>
                      <TextInput
                        type="text"
                        placeholder="What do you want written? (e.g., 'the story about my father')"
                        value={voicePrompt}
                        onChange={(e) => setVoicePrompt(e.target.value)}
                        className="mb-2"
                      />
                      <button
                        onClick={() => generateDraft(doc.id)}
                        disabled={generatingDraft || !voicePrompt.trim()}
                        className="rounded-lg border border-neon-lime/30 bg-neon-lime-dim px-4 py-1.5 text-xs font-medium text-neon-lime transition hover:border-neon-lime disabled:opacity-50"
                      >
                        {generatingDraft ? 'Writing in your voice...' : 'Generate Draft'}
                      </button>
                      {driftFeedback && (
                        <div
                          className={`mt-3 border rounded p-3 text-xs ${
                            driftFeedback.hasDrift
                              ? 'border-neon-purple-border bg-neon-purple-dim text-neon-purple'
                              : 'border-neon-lime-border bg-neon-lime-dim text-neon-lime'
                          }`}
                        >
                          <p>{driftFeedback.hasDrift ? 'Voice drift detected.' : 'Voice match looks strong.'}</p>
                          {driftFeedback.details && <p className="mt-1 text-app-fg">{driftFeedback.details}</p>}
                          {driftFeedback.rewriteSuggestion && (
                            <p className="mt-1 text-app-fg-muted">Suggestion: {driftFeedback.rewriteSuggestion}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 mt-3">
                      <PrimaryButton
                        onClick={() => saveDocument(doc.id)}
                        disabled={saving}
                        className="px-6"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </PrimaryButton>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    {doc.content ? (
                      <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-app-fg">
                        {doc.content}
                      </p>
                    ) : (
                      <p className="text-sm italic text-app-fg-muted">Empty document</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Shell>
  );
}
