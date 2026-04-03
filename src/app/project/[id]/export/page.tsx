'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type ExportLevel = 'raw' | 'structured' | 'polished' | 'full';

export default function ExportPage() {
  const { id } = useParams<{ id: string }>();
  const [exportLevel, setExportLevel] = useState<ExportLevel>('structured');
  const [includeTranscripts, setIncludeTranscripts] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeGaps, setIncludeGaps] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportLevels: Array<{ value: ExportLevel; label: string; description: string }> = [
    { value: 'raw', label: 'Raw Transcripts', description: 'Just the transcripts. Exactly as spoken. Nothing cleaned.' },
    { value: 'structured', label: 'Structured', description: 'Organized by document with raw transcripts attached. Structure intact.' },
    { value: 'polished', label: 'Polished Drafts', description: 'AI-written passages in your voice, organized by document.' },
    { value: 'full', label: 'Full Archive', description: 'Everything: raw transcripts, structured docs, drafts, annotations, gaps, questions.' },
  ];

  const handleExport = async () => {
    setExporting(true);
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

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${exportLevel}-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/project/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Export</h1>
        </div>

        <div className="bg-gray-900 border border-amber-700/50 rounded-xl p-5 mb-6">
          <p className="text-amber-300 text-sm">
            ⚠️ This is a graduated export. You control how much gets cleaned up. The raw material is always preserved
            — exporting doesn&apos;t destroy anything in the app.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {exportLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setExportLevel(level.value)}
              className={`w-full text-left rounded-xl p-5 border transition-colors ${
                exportLevel === level.value
                  ? 'border-indigo-500 bg-indigo-900/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-white">{level.label}</div>
              <div className="text-gray-400 text-sm mt-1">{level.description}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-medium">Include in export:</h3>
          {[
            { value: includeTranscripts, setter: setIncludeTranscripts, label: 'Raw transcripts alongside polished versions' },
            { value: includeAnnotations, setter: setIncludeAnnotations, label: 'AI annotations and session notes' },
            { value: includeGaps, setter: setIncludeGaps, label: 'Detected gaps and open questions' },
          ].map(({ value, setter, label }, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 accent-indigo-600"
              />
              <span className="text-gray-300 text-sm">{label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
        >
          {exporting ? 'Exporting...' : `Export as Markdown`}
        </button>
      </div>
    </div>
  );
}
