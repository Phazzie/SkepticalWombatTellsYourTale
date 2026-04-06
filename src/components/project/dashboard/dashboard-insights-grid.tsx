import Link from 'next/link';
import { DashboardInsightsProps } from '@/components/project/dashboard/types';

export function DashboardInsightsGrid({
  id,
  pendingTangents,
  openGaps,
  newPatterns,
  onResolveTangent,
  onResolveGap,
}: DashboardInsightsProps) {
  const total = pendingTangents.length + openGaps.length + newPatterns.length;
  const toPolar = (index: number, radiusPercent = 38) => {
    const angle = (360 / Math.max(total, 1)) * index - 90;
    const radians = (angle * Math.PI) / 180;
    const x = 50 + Math.cos(radians) * radiusPercent;
    const y = 50 + Math.sin(radians) * radiusPercent;
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-app-surface-muted p-5 shadow-app">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Insight Orbit</h2>
            <p className="text-xs text-app-fg-muted">Unresolved story work orbiting your next recording.</p>
          </div>
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
            {total} active
          </span>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm rounded-full border border-app-border bg-app-bg/60">
          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-400/60 bg-indigo-500/20 text-3xl">
            🎙️
          </div>
          {[...pendingTangents.slice(0, 4), ...openGaps.slice(0, 4), ...newPatterns.slice(0, 4)].map((item, idx) => {
            const isTangent = 'thread' in item;
            const isGap = 'resolved' in item;
            const label = isTangent ? '🧵' : isGap ? '🔍' : '🔁';
            const style = toPolar(idx);
            return (
              <div
                key={`${'id' in item ? item.id : idx}-orbit`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-app-border bg-app-surface px-3 py-1 text-xs"
                style={style}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧵</span>
          <h2 className="font-semibold text-white">Dropped Threads</h2>
          {pendingTangents.length > 0 && (
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
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
                <p className="text-sm text-amber-400 font-medium">{tangent.thread}</p>
                {tangent.context && (
                  <p className="mt-1 text-xs italic text-app-fg-muted">&quot;{tangent.context}&quot;</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onResolveTangent(tangent.id)}
                    className="text-xs text-green-400 hover:text-green-300"
                  >
                    ✓ Resolved
                  </button>
                </div>
              </div>
            ))}
            <Link href={`/project/${id}/tangents`} className="text-xs text-indigo-400 hover:text-indigo-300">
              View all tangents →
            </Link>
          </div>
        )}
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔍</span>
          <h2 className="font-semibold text-white">Gaps</h2>
          {openGaps.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
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
                <p className="text-sm text-red-400">{gap.description}</p>
                {gap.documentRef && (
                  <p className="mt-1 text-xs text-app-fg-muted">In: {gap.documentRef}</p>
                )}
                <button
                  onClick={() => onResolveGap(gap.id)}
                  className="text-xs text-green-400 hover:text-green-300 mt-2"
                >
                  ✓ Resolved
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/gaps`} className="text-xs text-indigo-400 hover:text-indigo-300">
              View all gaps →
            </Link>
          </div>
        )}
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔁</span>
          <h2 className="font-semibold text-white">Patterns</h2>
          {newPatterns.length > 0 && (
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
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
                <p className="text-sm text-purple-400">{pattern.description}</p>
                <p className="mt-1 text-xs text-app-fg-muted">
                  Seen in {pattern.sessionRefs.length} session(s)
                </p>
              </div>
            ))}
            <Link href={`/project/${id}/patterns`} className="text-xs text-indigo-400 hover:text-indigo-300">
              View all patterns →
            </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
