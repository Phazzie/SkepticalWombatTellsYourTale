import Link from 'next/link';
import { DashboardInsightsProps } from '@/components/project/dashboard/types';

const NEON_BADGE_STYLES = {
  lime: 'bg-neon-lime-dim text-neon-lime border border-neon-lime/40',
  pink: 'bg-neon-pink-dim text-neon-pink border border-neon-pink/40',
  purple: 'bg-neon-purple-dim text-neon-purple border border-neon-purple/40',
} as const;

function NeonBadge({ count, color }: { count: number; color: 'lime' | 'pink' | 'purple' }) {
  return (
    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${NEON_BADGE_STYLES[color]}`}>
      {count}
    </span>
  );
}

export function DashboardInsightsGrid({
  id,
  pendingTangents,
  openGaps,
  newPatterns,
  onResolveTangent,
  onResolveGap,
}: DashboardInsightsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {/* Dropped Threads */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-semibold text-white">Dropped Threads</span>
          {pendingTangents.length > 0 && <NeonBadge count={pendingTangents.length} color="lime" />}
        </div>
        {pendingTangents.length === 0 ? (
          <p className="text-app-fg-muted text-sm">No dropped threads yet.</p>
        ) : (
          <div className="space-y-2.5">
            {pendingTangents.slice(0, 5).map((tangent) => (
              <div key={tangent.id} className="rounded-xl bg-app-surface-muted p-3 border border-app-border">
                <p className="text-sm text-neon-lime font-medium">{tangent.thread}</p>
                {tangent.context && (
                  <p className="text-xs text-app-fg-muted mt-1 italic">&quot;{tangent.context}&quot;</p>
                )}
                <button
                  onClick={() => onResolveTangent(tangent.id)}
                  className="text-xs text-neon-lime/70 hover:text-neon-lime mt-2 transition-colors"
                >
                  ✓ Resolved
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/tangents`} className="text-xs text-app-fg-muted hover:text-neon-lime transition-colors">
              View all →
            </Link>
          </div>
        )}
      </div>

      {/* Gaps */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-semibold text-white">Gaps</span>
          {openGaps.length > 0 && <NeonBadge count={openGaps.length} color="pink" />}
        </div>
        {openGaps.length === 0 ? (
          <p className="text-app-fg-muted text-sm">No gaps detected yet.</p>
        ) : (
          <div className="space-y-2.5">
            {openGaps.slice(0, 5).map((gap) => (
              <div key={gap.id} className="rounded-xl bg-app-surface-muted p-3 border border-app-border">
                <p className="text-sm text-neon-pink">{gap.description}</p>
                {gap.documentRef && (
                  <p className="text-xs text-app-fg-muted mt-1">In: {gap.documentRef}</p>
                )}
                <button
                  onClick={() => onResolveGap(gap.id)}
                  className="text-xs text-neon-lime/70 hover:text-neon-lime mt-2 transition-colors"
                >
                  ✓ Resolved
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/gaps`} className="text-xs text-app-fg-muted hover:text-neon-lime transition-colors">
              View all →
            </Link>
          </div>
        )}
      </div>

      {/* Patterns */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-semibold text-white">Patterns</span>
          {newPatterns.length > 0 && <NeonBadge count={newPatterns.length} color="purple" />}
        </div>
        {newPatterns.length === 0 ? (
          <p className="text-app-fg-muted text-sm">No patterns detected yet.</p>
        ) : (
          <div className="space-y-2.5">
            {newPatterns.slice(0, 5).map((pattern) => (
              <div key={pattern.id} className="rounded-xl bg-app-surface-muted p-3 border border-app-border">
                <p className="text-sm text-neon-purple">{pattern.description}</p>
                <p className="text-xs text-app-fg-muted mt-1">
                  {pattern.sessionRefs.length} session{pattern.sessionRefs.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
            <Link href={`/project/${id}/patterns`} className="text-xs text-app-fg-muted hover:text-neon-lime transition-colors">
              View all →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
