'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, Shell, StatusMessage } from '@/components/ui/primitives';

type ExportLevel = 'raw' | 'structured' | 'polished' | 'full';

export default function ExportPage() {
  const { id } = useParams<{ id: string }>();
  const [exportLevel, setExportLevel] = useState<ExportLevel>('structured');
  const [includeTranscripts, setIncludeTranscripts] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeGaps, setIncludeGaps] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportLevels: Array<{ value: ExportLevel; label: string; description: string }> = [
    { value: 'raw', label: 'Raw Transcripts', description: 'Just the transcripts. Exactly as spoken. Nothing cleaned.' },
    { value: 'structured', label: 'Structured', description: 'Organized by document with raw transcripts attached.' },
    { value: 'polished', label: 'Polished Drafts', description: 'AI-written passages in your voice by document.' },
    { value: 'full', label: 'Full Archive', description: 'Everything: transcripts, docs, drafts, annotations, gaps.' },
  ];

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    const res = await fetch(`/api/projects/${id}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: exportLevel,
        includeTranscripts,
        includeAnnotations,
        includeGaps,
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Export failed');
      setExporting(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${exportLevel}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title="Export" subtitle="Graduated export with raw material always preserved." />

        {error && <StatusMessage state="error" title="Export failed" description={error} />}

        <Card className="mb-6 border-amber-700/50">
          <p className="text-sm text-amber-300">
            ⚠️ Choose how polished your export should be. Exporting never destroys anything in the app.
          </p>
        </Card>

        <div className="mb-6 space-y-3">
          {exportLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setExportLevel(level.value)}
              className={`w-full rounded-xl border p-5 text-left transition ${
                exportLevel === level.value
                  ? 'border-indigo-500 bg-indigo-900/20'
                  : 'border-app-border bg-app-surface hover:border-app-border-strong'
              }`}
            >
              <div className="font-medium text-white">{level.label}</div>
              <div className="mt-1 text-sm text-app-fg-muted">{level.description}</div>
            </button>
          ))}
        </div>

        <Card className="mb-6 space-y-3">
          <h3 className="font-medium">Include in export:</h3>
          {[
            { value: includeTranscripts, setter: setIncludeTranscripts, label: 'Raw transcripts alongside polished versions' },
            { value: includeAnnotations, setter: setIncludeAnnotations, label: 'AI annotations and session notes' },
            { value: includeGaps, setter: setIncludeGaps, label: 'Detected gaps and open questions' },
          ].map(({ value, setter, label }, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4 rounded border-app-border bg-app-surface-muted accent-indigo-500"
              />
              <span className="text-sm text-app-fg">{label}</span>
            </label>
          ))}
        </Card>

        <PrimaryButton onClick={handleExport} disabled={exporting} className="w-full py-4 text-lg">
          {exporting ? 'Exporting...' : 'Export as Markdown'}
        </PrimaryButton>
      </Container>
    </Shell>
  );
}
