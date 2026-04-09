'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Container, GlassCard, PrimaryButton, Shell, StatusMessage } from '@/components/ui/primitives';
import type { ExportLevel } from '@/lib/types';

const exportLevels: Array<{
  value: ExportLevel;
  label: string;
  description: string;
  hint: string;
}> = [
  {
    value: 'raw',
    label: 'Raw Transcripts',
    description: 'Just the transcripts. Exactly as spoken. Nothing cleaned.',
    hint: 'Most faithful',
  },
  {
    value: 'structured',
    label: 'Structured',
    description: 'Organized by document with raw transcripts attached.',
    hint: 'Recommended',
  },
  {
    value: 'polished',
    label: 'Polished Drafts',
    description: 'AI-written passages in your voice by document.',
    hint: 'Most readable',
  },
  {
    value: 'full',
    label: 'Full Archive',
    description: 'Everything: transcripts, docs, drafts, annotations, gaps.',
    hint: 'Complete',
  },
];

export default function ExportPage() {
  const { id } = useParams<{ id: string }>();
  const [exportLevel, setExportLevel] = useState<ExportLevel>('structured');
  const [includeTranscripts, setIncludeTranscripts] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeGaps, setIncludeGaps] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
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
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || 'Export failed');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${exportLevel}-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title="Export" subtitle="Choose your level of polish. Raw source is always preserved." />

        {error && <StatusMessage state="error" title="Export failed" description={error} />}

        {/* Warning banner */}
        <GlassCard className="mb-6 border-amber-500/25 bg-amber-500/5">
          <p className="text-sm text-amber-400/90">
            Exporting never deletes or modifies anything in the app. Choose how polished the output should be.
          </p>
        </GlassCard>

        {/* Export level selector */}
        <div className="mb-6 space-y-2.5">
          {exportLevels.map((level) => {
            const active = exportLevel === level.value;
            return (
              <button
                key={level.value}
                onClick={() => setExportLevel(level.value)}
                className={`w-full rounded-2xl border p-5 text-left transition-all duration-150 ${
                  active
                    ? 'border-neon-purple/50 bg-neon-purple-dim glow-purple'
                    : 'border-app-border bg-app-surface hover:border-app-border-strong hover:bg-app-surface-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm ${active ? 'text-neon-purple' : 'text-white'}`}>
                    {level.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    active
                      ? 'border-neon-purple/40 text-neon-purple bg-neon-purple-dim'
                      : 'border-app-border text-app-fg-muted'
                  }`}>
                    {level.hint}
                  </span>
                </div>
                <p className={`mt-1.5 text-sm ${active ? 'text-neon-purple/70' : 'text-app-fg-muted'}`}>
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Options */}
        <GlassCard className="mb-6 border-app-border space-y-3">
          <h3 className="font-semibold text-white text-sm">Include in export</h3>
          {[
            { value: includeTranscripts, setter: setIncludeTranscripts, label: 'Raw transcripts alongside polished versions' },
            { value: includeAnnotations, setter: setIncludeAnnotations, label: 'AI annotations and session notes' },
            { value: includeGaps, setter: setIncludeGaps, label: 'Detected gaps and open questions' },
          ].map(({ value, setter, label }, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-3 group">
              <span
                className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all group-focus-within:ring-2 group-focus-within:ring-neon-lime group-focus-within:ring-offset-2 group-focus-within:ring-offset-background ${
                  value
                    ? 'border-neon-lime/60 bg-neon-lime-dim'
                    : 'border-app-border bg-app-surface-muted group-hover:border-app-border-strong'
                }`}
              >
                {value && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden>
                    <path d="M1 4.5L4 7.5L10 1" stroke="#a3e635" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setter(e.target.checked)}
                  className="sr-only"
                />
              </span>
              <span className="text-sm text-app-fg">{label}</span>
            </label>
          ))}
        </GlassCard>

        <PrimaryButton
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-4 text-base"
        >
          {exporting ? 'Preparing export…' : 'Export as Markdown'}
        </PrimaryButton>
      </Container>
    </Shell>
  );
}
