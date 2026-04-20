'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage, TextArea, TextInput } from '@/components/ui/primitives';
import { useProjectDashboard } from '@/components/project/dashboard/use-project-dashboard';
import { DashboardActionCards } from '@/components/project/dashboard/dashboard-action-cards';
import { DashboardInsightsGrid } from '@/components/project/dashboard/dashboard-insights-grid';
import { DashboardQuestionsCard } from '@/components/project/dashboard/dashboard-questions-card';
import { DashboardConceptsContradictions } from '@/components/project/dashboard/dashboard-concepts-contradictions';
import { DashboardSearchCard } from '@/components/project/dashboard/dashboard-search-card';
import { requestJson } from '@/lib/client/request';
import { Project } from '@/lib/types';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const {
    project,
    loading,
    actionError,
    loadError,
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
    setProject,
  } = useProjectDashboard(id);

  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameDesc, setRenameDesc] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const openRename = () => {
    if (!project) return;
    setRenameValue(project.name);
    setRenameDesc(project.description ?? '');
    setRenameError(null);
    setShowRename(true);
  };

  const submitRename = async () => {
    if (!renameValue.trim() || !project) return;
    setRenaming(true);
    setRenameError(null);
    try {
      const res = await requestJson<Project | { error?: string }>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: { name: renameValue.trim(), description: renameDesc },
      });

      if (!res.ok || !res.data) {
        const failure = res.data as { error?: string } | null;
        throw new Error(failure?.error || 'Could not rename project');
      }

      const updated = res.data as Project;
      setProject(updated);
      setShowRename(false);
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Could not rename project');
    } finally {
      setRenaming(false);
    }
  };

  if (loading) {
    return <Shell><Container><StatusMessage state="loading" title="Loading project..." /></Container></Shell>;
  }

  if (!project) {
    return (
      <Shell>
        <Container>
          <StatusMessage state="error" title={loadError || 'Project not found'} />
        </Container>
      </Shell>
    );
  }

  const sessionCount = project.sessions?.length || 0;

  return (
    <Shell>
      <Container wide>
        <AppBackLink href="/" label="Projects" />
        <div className="mt-4" />

        {showRename ? (
          <Card className="mb-6 border-indigo-700">
            <h3 className="text-sm font-semibold text-app-fg-muted mb-3">Rename project</h3>
            <TextInput
              type="text"
              placeholder="Project name..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mb-3"
              onKeyDown={(e) => e.key === 'Enter' && submitRename()}
              autoFocus
            />
            <TextArea
              placeholder="Description (optional)"
              value={renameDesc}
              onChange={(e) => setRenameDesc(e.target.value)}
              rows={2}
              className="mb-4 resize-none"
            />
            {renameError && <p className="text-sm text-red-400 mb-3">{renameError}</p>}
            <div className="flex gap-3">
              <PrimaryButton onClick={submitRename} disabled={renaming || !renameValue.trim()}>
                {renaming ? 'Saving...' : 'Save'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setShowRename(false)}>Cancel</SecondaryButton>
            </div>
          </Card>
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <AppHeader title={project.name} subtitle={project.description || undefined} showMark />
            </div>
            <button
              onClick={openRename}
              aria-label="Rename project"
              className="mt-1 rounded-lg p-1.5 text-app-fg-muted transition hover:bg-app-surface-strong hover:text-white shrink-0"
            >
              ✏️
            </button>
          </div>
        )}

        {actionError && (
          <div role="alert">
            <Card className="mb-6 border-red-700 bg-red-900/20 text-sm text-red-300">
              {actionError}
            </Card>
          </div>
        )}

        {sessionCount === 0 ? (
          <Card className="mb-6 text-center py-12">
            <div className="text-4xl mb-4">🎙️</div>
            <h2 className="text-xl font-bold text-white mb-6">Ready to start?</h2>
            <div className="max-w-md mx-auto space-y-4 text-left mb-8">
              <div className="flex gap-3 items-start">
                <span className="text-neon-lime font-bold shrink-0">1</span>
                <p className="text-app-fg-muted text-sm">Hit Record and just talk. Don&apos;t worry about what to say.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-neon-lime font-bold shrink-0">2</span>
                <p className="text-app-fg-muted text-sm">The Wombat will find the threads, contradictions, and moments that matter.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-neon-lime font-bold shrink-0">3</span>
                <p className="text-app-fg-muted text-sm">Come back and keep going. The more you record, the richer the analysis.</p>
              </div>
            </div>
            <Link href={`/project/${id}/record`}>
              <PrimaryButton className="px-6 py-3 text-base">Start recording</PrimaryButton>
            </Link>
          </Card>
        ) : (
          <>
            <DashboardActionCards
              id={id}
              documentCount={project.documents?.length || 0}
              sessionCount={sessionCount}
            />

            <DashboardInsightsGrid
              id={id}
              pendingTangents={pendingTangents}
              openGaps={openGaps}
              newPatterns={newPatterns}
              onResolveTangent={resolveTangent}
              onResolveGap={resolveGap}
            />

            <DashboardQuestionsCard id={id} pendingQuestionsCount={pendingQuestions.length} />

            <DashboardConceptsContradictions
              id={id}
              pendingConcepts={pendingConcepts}
              openContradictions={openContradictions}
              onApproveConcept={(conceptId) => updateConcept(conceptId, true)}
              onMarkContradictionExplored={(contradictionId) => updateContradiction(contradictionId, 'explored')}
            />

            <DashboardSearchCard
              searchTerm={searchTerm}
              searching={searching}
              searchResults={searchResults}
              onSearchTermChange={setSearchTerm}
              onSearch={searchProject}
            />
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {['gaps', 'tangents', 'patterns', 'concepts', 'contradictions', 'search'].map((route) => (
            <Link
              key={route}
              href={`/project/${id}/${route}`}
              className="capitalize text-app-fg-muted hover:text-neon-lime transition-colors"
            >
              {route} →
            </Link>
          ))}
        </div>
      </Container>
    </Shell>
  );
}
