import Link from 'next/link';
import { Card } from '@/components/ui/primitives';
import { DashboardInsightsProps } from '@/components/project/dashboard/types';

export function DashboardInsightsGrid({
  id,
  pendingTangents,
  openGaps,
  newPatterns,
  onResolveTangent,
  onResolveGap,
}: DashboardInsightsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">🧵</span>
          <h2 className="font-semibold text-app-fg">Dropped Threads</h2>
          {pendingTangents.length > 0 && (
            <span className="ml-auto rounded-full border border-neon-purple-border bg-neon-purple-dim px-2 py-0.5 text-xs font-bold text-neon-purple">
              {pendingTangents.length}
            </span>
          )}
        </div>
        {pendingTangents.length === 0 ? (
          <p className="text-sm text-app-fg-muted">No dropped threads yet.</p>
        ) : (
          <div className="space-y-3">
            {pendingTangents.slice(0, 5).map((tangent) => (
              <div key={tangent.id} className="rounded-xl border border-app-border bg-app-surface-muted p-3">
                <p className="text-sm font-medium text-neon-purple">{tangent.thread}</p>
                {tangent.context && (
                  <p className="mt-1 text-xs italic text-app-fg-muted">&quot;{tangent.context}&quot;</p>
                )}
                <button
                  onClick={() => onResolveTangent(tangent.id)}
                  className="mt-2 text-xs text-neon-lime transition hover:text-neon-lime/80"
                >
                  ✓ Resolved
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/tangents`} className="text-xs text-neon-lime transition hover:text-neon-lime/80">
              View all tangents →
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <h2 className="font-semibold text-app-fg">Gaps</h2>
          {openGaps.length > 0 && (
            <span className="ml-auto rounded-full border border-neon-pink-border bg-neon-pink-dim px-2 py-0.5 text-xs font-bold text-neon-pink">
              {openGaps.length}
            </span>
          )}
        </div>
        {openGaps.length === 0 ? (
          <p className="text-sm text-app-fg-muted">No gaps detected yet. Add more sessions.</p>
        ) : (
          <div className="space-y-3">
            {openGaps.slice(0, 5).map((gap) => (
              <div key={gap.id} className="rounded-xl border border-app-border bg-app-surface-muted p-3">
                <p className="text-sm text-neon-pink">{gap.description}</p>
                {gap.documentRef && (
                  <p className="mt-1 text-xs text-app-fg-muted">In: {gap.documentRef}</p>
                )}
                <button
                  onClick={() => onResolveGap(gap.id)}
                  className="mt-2 text-xs text-neon-lime transition hover:text-neon-lime/80"
                >
                  ✓ Resolved
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/gaps`} className="text-xs text-neon-lime transition hover:text-neon-lime/80">
              View all gaps →
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">🔁</span>
          <h2 className="font-semibold text-app-fg">Patterns</h2>
          {newPatterns.length > 0 && (
            <span className="ml-auto rounded-full border border-neon-lime-border bg-neon-lime-dim px-2 py-0.5 text-xs font-bold text-neon-lime">
              {newPatterns.length}
            </span>
          )}
        </div>
        {newPatterns.length === 0 ? (
          <p className="text-sm text-app-fg-muted">No patterns detected yet.</p>
        ) : (
          <div className="space-y-3">
            {newPatterns.slice(0, 5).map((pattern) => (
              <div key={pattern.id} className="rounded-xl border border-app-border bg-app-surface-muted p-3">
                <p className="text-sm text-neon-lime">{pattern.description}</p>
                <p className="mt-1 text-xs text-app-fg-muted">
                  {pattern.sessionRefs.length} {pattern.sessionRefs.length === 1 ? 'session' : 'sessions'}
                </p>
              </div>
            ))}
            <Link href={`/project/${id}/patterns`} className="text-xs text-neon-lime transition hover:text-neon-lime/80">
              View all patterns →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
