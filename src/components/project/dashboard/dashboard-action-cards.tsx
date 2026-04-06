import Link from 'next/link';

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
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Link
        href={`/project/${id}/record`}
        className="rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-indigo-500/25 via-indigo-600/20 to-purple-500/20 p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/70"
      >
        <div className="mb-2 text-3xl">🎙️</div>
        <div className="font-semibold text-white">Record</div>
        <div className="mt-1 text-xs text-indigo-200">Start a listening session</div>
      </Link>
      <Link
        href={`/project/${id}/documents`}
        className="rounded-2xl border border-app-border bg-app-surface p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-app-border-strong"
      >
        <div className="mb-2 text-3xl">📄</div>
        <div className="font-semibold">Documents</div>
        <div className="mt-1 text-xs text-app-fg-muted">{documentCount} docs</div>
      </Link>
      <Link
        href={`/project/${id}/sessions`}
        className="rounded-2xl border border-app-border bg-app-surface p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-app-border-strong"
      >
        <div className="mb-2 text-3xl">📼</div>
        <div className="font-semibold">Sessions</div>
        <div className="mt-1 text-xs text-app-fg-muted">{sessionCount} sessions</div>
      </Link>
      <Link
        href={`/project/${id}/export`}
        className="rounded-2xl border border-app-border bg-app-surface p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:border-app-border-strong"
      >
        <div className="mb-2 text-3xl">📤</div>
        <div className="font-semibold">Export</div>
        <div className="mt-1 text-xs text-app-fg-muted">Raw · Structured · Polished · Full</div>
      </Link>
    </div>
  );
}
