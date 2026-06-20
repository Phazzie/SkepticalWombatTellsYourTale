import Link from 'next/link';
import { Card } from '@/components/ui/primitives';

export function DashboardQuestionsCard({ id, pendingQuestionsCount }: { id: string; pendingQuestionsCount: number }) {
  return (
    <Card className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">❓</span>
        <h2 className="font-semibold text-app-fg">Questions for You</h2>
      </div>
      <Link
        href={`/project/${id}/questions`}
        className="text-sm text-neon-lime transition hover:text-neon-lime/80"
      >
        View all questions →
      </Link>
      <p className="mt-2 text-xs text-app-fg-muted">{pendingQuestionsCount} pending</p>
    </Card>
  );
}
