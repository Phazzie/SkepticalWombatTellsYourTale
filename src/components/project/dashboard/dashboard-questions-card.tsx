import Link from 'next/link';

export function DashboardQuestionsCard({ id, pendingQuestionsCount }: { id: string; pendingQuestionsCount: number }) {
  return (
    <div className="mt-6 rounded-2xl border border-app-border bg-app-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">❓</span>
        <h2 className="font-semibold text-white">Questions for You</h2>
        <span className="ml-auto rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
          {pendingQuestionsCount} pending
        </span>
      </div>
      <Link
        href={`/project/${id}/questions`}
        className="text-indigo-400 hover:text-indigo-300 text-sm"
      >
        View all questions and prompts →
      </Link>
    </div>
  );
}
