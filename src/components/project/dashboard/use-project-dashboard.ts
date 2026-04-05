'use client';

import { useEffect, useMemo, useState } from 'react';
import { Project } from '@/lib/types';
import { requestJson } from '@/lib/client/request';
import { ProjectSearchResult } from '@/components/project/dashboard/types';

function getNextConceptStatus(
  currentStatus: 'developing' | 'complete' | 'contradicted' | undefined,
  approved: boolean
): 'developing' | 'complete' | 'contradicted' {
  if (approved) return 'complete';
  if (currentStatus === 'complete') return 'developing';
  return currentStatus || 'developing';
}

export function useProjectDashboard(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProjectSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    requestJson<Project>(`/api/projects/${projectId}?include=all`)
      .then(({ ok, data }) => {
        if (ok) setProject(data);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const pendingTangents = useMemo(
    () => project?.tangents?.filter((t) => t.status === 'pending') || [],
    [project]
  );
  const openGaps = useMemo(
    () => project?.gaps?.filter((g) => !g.resolved) || [],
    [project]
  );
  const newPatterns = useMemo(
    () => project?.patterns?.filter((p) => !p.acknowledged) || [],
    [project]
  );
  const pendingQuestions = useMemo(
    () => project?.questions?.filter((q) => q.status === 'pending') || [],
    [project]
  );
  const pendingConcepts = useMemo(
    () => project?.concepts?.filter((c) => !c.approved) || [],
    [project]
  );
  const openContradictions = useMemo(
    () => project?.contradictions?.filter((c) => c.status === 'open') || [],
    [project]
  );

  const resolveTangent = async (tangentId: string) => {
    const previousStatus = project?.tangents?.find((t) => t.id === tangentId)?.status;
    setActionError(null);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            tangents: prev.tangents?.map((t) =>
              t.id === tangentId ? { ...t, status: 'resolved' as const } : t
            ),
          }
        : prev
    );

    const { ok, status } = await requestJson<{ success: boolean }>(`/api/projects/${projectId}/tangents/${tangentId}`, {
      method: 'PATCH',
      body: { status: 'resolved' },
    });

    if (ok) return;

    if (previousStatus) {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tangents: prev.tangents?.map((t) =>
                t.id === tangentId ? { ...t, status: previousStatus } : t
              ),
            }
          : prev
      );
    }
    setActionError(`Failed to resolve thread (${status})`);
  };

  const resolveGap = async (gapId: string) => {
    const previousResolved = project?.gaps?.find((g) => g.id === gapId)?.resolved;
    setActionError(null);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            gaps: prev.gaps?.map((g) =>
              g.id === gapId ? { ...g, resolved: true } : g
            ),
          }
        : prev
    );

    const { ok, status } = await requestJson<{ success: boolean }>(`/api/projects/${projectId}/gaps/${gapId}`, {
      method: 'PATCH',
      body: { resolved: true },
    });

    if (ok) return;

    if (typeof previousResolved === 'boolean') {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              gaps: prev.gaps?.map((g) =>
                g.id === gapId ? { ...g, resolved: previousResolved } : g
              ),
            }
          : prev
      );
    }
    setActionError(`Failed to resolve gap (${status})`);
  };

  const updateConcept = async (conceptId: string, approved: boolean) => {
    const current = project?.concepts?.find((c) => c.id === conceptId);
    const nextStatus = getNextConceptStatus(current?.status, approved);
    const previousConcept = current
      ? { approved: current.approved, status: current.status }
      : null;

    setActionError(null);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            concepts: prev.concepts?.map((c) =>
              c.id === conceptId ? { ...c, approved, status: nextStatus } : c
            ),
          }
        : prev
    );

    const { ok, status } = await requestJson(`/api/projects/${projectId}/concepts`, {
      method: 'PATCH',
      body: { conceptId, approved, status: nextStatus },
    });

    if (ok) return;

    if (previousConcept) {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              concepts: prev.concepts?.map((c) =>
                c.id === conceptId
                  ? { ...c, approved: previousConcept.approved, status: previousConcept.status }
                  : c
              ),
            }
          : prev
      );
    }
    setActionError(`Failed to update concept (${status})`);
  };

  const updateContradiction = async (contradictionId: string, status: 'open' | 'explored' | 'dismissed') => {
    const previousStatus = project?.contradictions?.find((c) => c.id === contradictionId)?.status;

    setActionError(null);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            contradictions: prev.contradictions?.map((c) =>
              c.id === contradictionId ? { ...c, status } : c
            ),
          }
        : prev
    );

    const response = await requestJson(`/api/projects/${projectId}/contradictions`, {
      method: 'PATCH',
      body: { contradictionId, status },
    });

    if (response.ok) return;

    if (previousStatus) {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              contradictions: prev.contradictions?.map((c) =>
                c.id === contradictionId ? { ...c, status: previousStatus } : c
              ),
            }
          : prev
      );
    }
    setActionError(`Failed to update contradiction (${response.status})`);
  };

  const searchProject = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    setSearching(true);

    const { ok, data } = await requestJson<{ query: string; results: ProjectSearchResult[] }>(
      `/api/projects/${projectId}/search?q=${encodeURIComponent(trimmed)}`
    );

    setSearchResults(ok ? data.results || [] : []);
    setSearching(false);
  };

  return {
    project,
    loading,
    actionError,
    pendingTangents,
    openGaps,
    newPatterns,
    pendingQuestions,
    pendingConcepts,
    openContradictions,
    searchTerm,
    setSearchTerm,
    searchResults,
    searching,
    resolveTangent,
    resolveGap,
    updateConcept,
    updateContradiction,
    searchProject,
  };
}
