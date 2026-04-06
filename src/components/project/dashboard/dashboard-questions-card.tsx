import Link from 'next/link';

export function DashboardQuestionsCard({ id, pendingQuestionsCount }: { id: string; pendingQuestionsCount: number }) {
  return (
    <div className="mt-4 rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Questions for You</h2>
          <p className="text-app-fg-muted text-sm mt-0.5">
            {pendingQuestionsCount > 0
              ? <><span className="text-neon-lime font-medium">{pendingQuestionsCount}</span> pending</>
              : 'No pending questions'}
          </p>
        </div>
        <Link
          href={`/project/${id}/questions`}
          className="rounded-xl border border-app-border bg-app-surface-muted px-4 py-2 text-sm text-app-fg-muted hover:text-white hover:border-app-border-strong transition-colors"
        >
          View all →
        </Link>
      </div>
    </div>
  );
}
