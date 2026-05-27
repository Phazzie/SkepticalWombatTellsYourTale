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
    <div className="mt-4 grid md:grid-cols-2 gap-4">
      {/* Concept Candidates */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
        <h2 className="font-semibold text-white mb-4">Concept Candidates</h2>
        {pendingConcepts.length === 0 ? (
          <p className="text-app-fg-muted text-sm">No pending concept names.</p>
        ) : (
          <div className="space-y-2.5">
            {pendingConcepts.slice(0, 5).map((concept) => (
              <div key={concept.id} className="rounded-xl bg-app-surface-muted p-3 border border-app-border">
                <p className="text-sm text-neon-lime font-medium">{concept.name}</p>
                <p className="text-xs text-app-fg-muted mt-1">{concept.definition}</p>
                <button
                  onClick={() => onApproveConcept(concept.id)}
                  className="text-xs text-neon-lime/70 hover:text-neon-lime mt-2 transition-colors"
                >
                  ✓ Approve
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/concepts`} className="text-xs text-app-fg-muted hover:text-neon-lime transition-colors">
              View all →
            </Link>
          </div>
        )}
      </div>

      {/* Open Contradictions */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
        <h2 className="font-semibold text-white mb-4">Open Contradictions</h2>
        {openContradictions.length === 0 ? (
          <p className="text-app-fg-muted text-sm">No unresolved contradictions.</p>
        ) : (
          <div className="space-y-2.5">
            {openContradictions.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl bg-neon-pink-dim p-3 border border-neon-pink/20">
                <p className="text-sm text-neon-pink">{item.description}</p>
                <button
                  onClick={() => onMarkContradictionExplored(item.id)}
                  className="text-xs text-neon-lime/70 hover:text-neon-lime mt-2 transition-colors"
                >
                  ✓ Mark explored
                </button>
              </div>
            ))}
            <Link href={`/project/${id}/contradictions`} className="text-xs text-app-fg-muted hover:text-neon-lime transition-colors">
              View all →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
