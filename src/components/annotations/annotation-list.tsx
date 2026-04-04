'use client';

import { useMemo } from 'react';
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

const fallbackAnnotationClass = 'bg-app-surface-muted border-app-border text-app-fg';
const fallbackAnnotationIcon = '💡';

const knownAnnotationTypes = new Set<AIAnnotation['type']>([
  'important',
  'connection',
  'unfinished',
  'tangent',
  'pattern',
]);

function isKnownAnnotationType(value: unknown): value is AIAnnotation['type'] {
  return typeof value === 'string' && knownAnnotationTypes.has(value as AIAnnotation['type']);
}

interface AnnotationListProps {
  annotations: AIAnnotation[];
  showReference?: boolean;
}

function getAnnotationKeyBase(annotation: AIAnnotation): string {
  return `${annotation.timestamp ?? ''}\u0000${annotation.type}\u0000${annotation.reference ?? ''}\u0000${annotation.text}`;
}

export function AnnotationList({ annotations, showReference = false }: AnnotationListProps) {
  const keyedAnnotations = useMemo(() => {
    const keyCounts = new Map<string, number>();

    return annotations.map((ann) => {
      const keyBase = getAnnotationKeyBase(ann);
      const occurrence = keyCounts.get(keyBase) ?? 0;
      keyCounts.set(keyBase, occurrence + 1);
      const key = occurrence === 0 ? keyBase : `${keyBase}:${occurrence}`;

      const annotationType = isKnownAnnotationType(ann.type) ? ann.type : null;
      const rowClass = annotationType ? annotationColors[annotationType] : fallbackAnnotationClass;
      const icon = annotationType ? annotationIcons[annotationType] : fallbackAnnotationIcon;

      return { ann, key, rowClass, icon };
    });
  }, [annotations]);

  return (
    <div className="space-y-2">
      {keyedAnnotations.map(({ ann, key, rowClass, icon }) => (
        <div
          key={key}
          className={`rounded-lg border px-3 py-2 text-sm ${rowClass}`}
        >
          <span className="mr-2">{icon}</span>
          {ann.text}
          {showReference && ann.reference && <span className="ml-2 text-xs opacity-70">({ann.reference})</span>}
        </div>
      ))}
    </div>
  );
}
