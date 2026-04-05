'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, Shell, StatusMessage } from '@/components/ui/primitives';
import { useProjectDashboard } from '@/components/project/dashboard/use-project-dashboard';
import { DashboardActionCards } from '@/components/project/dashboard/dashboard-action-cards';
import { DashboardInsightsGrid } from '@/components/project/dashboard/dashboard-insights-grid';
import { DashboardQuestionsCard } from '@/components/project/dashboard/dashboard-questions-card';
import { DashboardConceptsContradictions } from '@/components/project/dashboard/dashboard-concepts-contradictions';
import { DashboardSearchCard } from '@/components/project/dashboard/dashboard-search-card';

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
  } = useProjectDashboard(id);

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

  return (
    <Shell>
      <Container wide>
        <AppBackLink href="/" label="Projects" />
        <div className="mt-4" />
        <AppHeader title={project.name} subtitle={project.description || undefined} />

        {actionError && (
          <div role="alert">
            <Card className="mb-6 border-red-700 bg-red-900/20 text-sm text-red-300">
              {actionError}
            </Card>
          </div>
        )}

        <DashboardActionCards
          id={id}
          documentCount={project.documents?.length || 0}
          sessionCount={project.sessions?.length || 0}
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

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href={`/project/${id}/gaps`} className="text-indigo-400 hover:text-indigo-300">Gaps →</Link>
          <Link href={`/project/${id}/tangents`} className="text-indigo-400 hover:text-indigo-300">Tangents →</Link>
          <Link href={`/project/${id}/patterns`} className="text-indigo-400 hover:text-indigo-300">Patterns →</Link>
          <Link href={`/project/${id}/concepts`} className="text-indigo-400 hover:text-indigo-300">Concepts →</Link>
          <Link href={`/project/${id}/contradictions`} className="text-indigo-400 hover:text-indigo-300">Contradictions →</Link>
          <Link href={`/project/${id}/search`} className="text-indigo-400 hover:text-indigo-300">Search →</Link>
        </div>
      </Container>
    </Shell>
  );
}
