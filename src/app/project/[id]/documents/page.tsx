'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Document } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import {
  AppBackLink,
  Card,
  Container,
  PrimaryButton,
  SecondaryButton,
  Shell,
  StatusMessage,
  TextArea,
  TextInput,
} from '@/components/ui/primitives';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}/documents`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load documents');
        return r.json();
      })
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
        setLoading(false);
      });
  }, [id]);

  const createDocument = async () => {
    if (!newName.trim()) return;

    const res = await fetch(`/api/projects/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, type: newType }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Failed to create document');
      return;
    }

    const doc = await res.json();
    setDocuments((prev) => [...prev, doc]);
    setNewName('');
    setShowNew(false);
  };

  const saveDocument = async (docId: string) => {
    setSaving(true);
    const res = await fetch(`/api/projects/${id}/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Failed to save document');
      setSaving(false);
      return;
    }

    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, content: editContent } : d)));
    setSaving(false);
    setEditingId(null);
  };

  const generateDraft = async (docId: string) => {
    if (!voicePrompt.trim()) return;
    setGeneratingDraft(true);

    const res = await fetch(`/api/projects/${id}/voice-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId, prompt: voicePrompt }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Failed to generate draft');
      setGeneratingDraft(false);
      return;
    }

    const { draft } = (await res.json()) as { draft: string };
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      const newContent = doc.content ? `${doc.content}\n\n---\n\n${draft}` : draft;
      setEditContent(newContent);
    }

    setVoicePrompt('');
    setGeneratingDraft(false);
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

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {showNew && (
          <Card className="mb-6">
            <h3 className="mb-3 font-semibold">New Document</h3>
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
              className="mb-4 w-full rounded-xl border border-app-border bg-app-surface-muted px-4 py-2 text-sm text-app-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <PrimaryButton onClick={createDocument}>Create</PrimaryButton>
              <SecondaryButton onClick={() => setShowNew(false)}>Cancel</SecondaryButton>
            </div>
          </Card>
        )}

        {documents.length === 0 ? (
          <StatusMessage
            state="empty"
            title="No documents yet"
            description="Create your first working document."
          />
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
                  <div>
                    <span className="font-semibold text-white">{doc.name}</span>
                    <span className="ml-2 rounded bg-app-surface-muted px-2 py-0.5 text-xs text-app-fg-muted">{doc.type}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(editingId === doc.id ? null : doc.id);
                      setEditContent(doc.content);
                    }}
                    className="text-sm text-indigo-300 hover:text-indigo-200"
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
                      className="resize-none font-mono text-sm"
                      placeholder="Document content..."
                    />
                    <div className="mt-4 rounded-xl border border-app-border bg-app-surface-muted p-4">
                      <p className="mb-2 text-xs text-emerald-300">✍️ Generate in your voice</p>
                      <TextInput
                        type="text"
                        placeholder="What do you want written?"
                        value={voicePrompt}
                        onChange={(e) => setVoicePrompt(e.target.value)}
                        className="mb-2"
                      />
                      <PrimaryButton
                        onClick={() => generateDraft(doc.id)}
                        disabled={generatingDraft || !voicePrompt.trim()}
                        className="text-xs"
                      >
                        {generatingDraft ? 'Writing in your voice...' : 'Generate Draft'}
                      </PrimaryButton>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <PrimaryButton onClick={() => saveDocument(doc.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </PrimaryButton>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    {doc.content ? (
                      <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-app-fg-muted">
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
