import Link from 'next/link';

const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <rect x="9" y="2" width="10" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 14c0 4.97 4.03 9 9 9s9-4.03 9-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="14" y1="23" x2="14" y2="27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
    <path d="M6 3h10l5 5v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M16 3v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <line x1="9" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ReelIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
    <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="13" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="13" cy="5.5" r="1.2" fill="currentColor" />
    <circle cx="13" cy="20.5" r="1.2" fill="currentColor" />
    <circle cx="5.5" cy="13" r="1.2" fill="currentColor" />
    <circle cx="20.5" cy="13" r="1.2" fill="currentColor" />
  </svg>
);

const ExportIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
    <path d="M13 3v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 11l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export function DashboardActionCards({
  id,
  documentCount,
  sessionCount,
}: {
  id: string;
  documentCount: number;
  sessionCount: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {/* Record — primary CTA, neon lime */}
      <Link
        href={`/project/${id}/record`}
        className="group relative overflow-hidden rounded-2xl border border-neon-lime/30 bg-neon-lime-dim p-5 text-center transition-all duration-200 hover:border-neon-lime/60 hover:shadow-neon-lime"
      >
        <div className="flex justify-center mb-3 text-neon-lime transition-transform duration-200 group-hover:scale-110">
          <MicIcon />
        </div>
        <div className="font-semibold text-neon-lime text-sm">Record</div>
        <div className="text-neon-lime/60 text-xs mt-0.5">Voice session</div>
      </Link>

      {/* Documents */}
      <Link
        href={`/project/${id}/documents`}
        className="group relative overflow-hidden rounded-2xl border border-app-border bg-app-surface p-5 text-center transition-all duration-200 hover:border-app-border-strong hover:bg-app-surface-strong"
      >
        <div className="flex justify-center mb-3 text-app-fg-muted transition-colors duration-200 group-hover:text-white">
          <DocIcon />
        </div>
        <div className="font-semibold text-sm text-white">Documents</div>
        <div className="text-app-fg-muted text-xs mt-0.5">{documentCount} doc{documentCount !== 1 ? 's' : ''}</div>
      </Link>

      {/* Sessions */}
      <Link
        href={`/project/${id}/sessions`}
        className="group relative overflow-hidden rounded-2xl border border-app-border bg-app-surface p-5 text-center transition-all duration-200 hover:border-app-border-strong hover:bg-app-surface-strong"
      >
        <div className="flex justify-center mb-3 text-app-fg-muted transition-colors duration-200 group-hover:text-white">
          <ReelIcon />
        </div>
        <div className="font-semibold text-sm text-white">Sessions</div>
        <div className="text-app-fg-muted text-xs mt-0.5">{sessionCount} session{sessionCount !== 1 ? 's' : ''}</div>
      </Link>

      {/* Export */}
      <Link
        href={`/project/${id}/export`}
        className="group relative overflow-hidden rounded-2xl border border-neon-purple/25 bg-neon-purple-dim p-5 text-center transition-all duration-200 hover:border-neon-purple/50 hover:shadow-neon-purple"
      >
        <div className="flex justify-center mb-3 text-neon-purple transition-transform duration-200 group-hover:scale-110">
          <ExportIcon />
        </div>
        <div className="font-semibold text-neon-purple text-sm">Export</div>
        <div className="text-neon-purple/60 text-xs mt-0.5">Download work</div>
      </Link>
    </div>
  );
}
