'use client';

import { AIAnnotation } from '@/lib/types';

const annotationColors: Record<AIAnnotation['type'], string> = {
  important: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
  connection: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  unfinished: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  tangent: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  pattern: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
};

const annotationIcons: Record<AIAnnotation['type'], string> = {
  important: '⚡',
  connection: '🔗',
  unfinished: '🧵',
  tangent: '↪️',
  pattern: '🔁',
};

interface AnnotationListProps {
  annotations: AIAnnotation[];
  showReference?: boolean;
}

export function AnnotationList({ annotations, showReference = false }: AnnotationListProps) {
  return (
    <div className="space-y-2">
      {annotations.map((ann, i) => (
        <div
          key={`${ann.timestamp ?? 'na'}-${i}`}
          className={`rounded-lg border px-3 py-2 text-sm ${annotationColors[ann.type]}`}
        >
          <span className="mr-2">{annotationIcons[ann.type]}</span>
          {ann.text}
          {showReference && ann.reference && <span className="ml-2 text-xs opacity-70">({ann.reference})</span>}
        </div>
      ))}
    </div>
  );
}
