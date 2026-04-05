import Link from 'next/link';
import { DashboardConceptsContradictionsProps } from '@/components/project/dashboard/types';

export function DashboardConceptsContradictions({
  id,
  pendingConcepts,
  openContradictions,
  onApproveConcept,
  onMarkContradictionExplored,
}: DashboardConceptsContradictionsProps) {
  return (
    <div className="mt-6 grid md:grid-cols-2 gap-6">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏷️</span>
          <h2 className="font-semibold text-white">Concept Candidates</h2>
        </div>
        {pendingConcepts.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending concept names.</p>
        ) : (
          <div className="space-y-3">
            {pendingConcepts.slice(0, 5).map((concept) => (
              <div key={concept.id} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-green-300 font-medium">{concept.name}</p>
                <p className="text-xs text-gray-400 mt-1">{concept.definition}</p>
                <button
                  onClick={() => onApproveConcept(concept.id)}
                  className="text-xs text-green-400 hover:text-green-300 mt-2"
                >
                  ✓ Approve
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/concepts`} className="text-xs text-indigo-400 hover:text-indigo-300">
              View all concepts →
            </Link>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚖️</span>
          <h2 className="font-semibold text-white">Open Contradictions</h2>
        </div>
        {openContradictions.length === 0 ? (
          <p className="text-gray-500 text-sm">No unresolved contradictions.</p>
        ) : (
          <div className="space-y-3">
            {openContradictions.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-red-300">{item.description}</p>
                <button
                  onClick={() => onMarkContradictionExplored(item.id)}
                  className="text-xs text-green-400 hover:text-green-300 mt-2"
                >
                  ✓ Mark explored
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/contradictions`} className="text-xs text-indigo-400 hover:text-indigo-300">
              View all contradictions →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
