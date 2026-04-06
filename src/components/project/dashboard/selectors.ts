import { Gap, Tangent } from '@/lib/types';

export function isPendingTangent(tangent: Tangent) {
  return tangent.status === 'pending';
}

export function isOpenGap(gap: Gap) {
  return !gap.resolved;
}
