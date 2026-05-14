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
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
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
          <p className="text-gray-500 text-sm">No dropped threads yet.</p>
        ) : (
          <div className="space-y-3">
            {pendingTangents.slice(0, 5).map((tangent) => (
              <div key={tangent.id} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-amber-400 font-medium">{tangent.thread}</p>
                {tangent.context && (
                  <p className="text-xs text-gray-500 mt-1 italic">&quot;{tangent.context}&quot;</p>
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

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
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
          <p className="text-gray-500 text-sm">No gaps detected yet. Add more sessions.</p>
        ) : (
          <div className="space-y-3">
            {openGaps.slice(0, 5).map((gap) => (
              <div key={gap.id} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-red-400">{gap.description}</p>
                {gap.documentRef && (
                  <p className="text-xs text-gray-500 mt-1">In: {gap.documentRef}</p>
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

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
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
          <p className="text-gray-500 text-sm">No patterns detected yet.</p>
        ) : (
          <div className="space-y-3">
            {newPatterns.slice(0, 5).map((pattern) => (
              <div key={pattern.id} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-purple-400">{pattern.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pattern.sessionRefs.length} {pattern.sessionRefs.length === 1 ? 'session' : 'sessions'}
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
  );
}
