import Link from 'next/link';

export function DashboardQuestionsCard({ id, pendingQuestionsCount }: { id: string; pendingQuestionsCount: number }) {
  return (
    <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">❓</span>
        <h2 className="font-semibold text-white">Questions for You</h2>
      </div>
      <Link
        href={`/project/${id}/questions`}
        className="text-indigo-400 hover:text-indigo-300 text-sm"
      >
        View all questions →
      </Link>
      <p className="text-gray-500 text-xs mt-2">{pendingQuestionsCount} pending</p>
    </div>
  );
}
