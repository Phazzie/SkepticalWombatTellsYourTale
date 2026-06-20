'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage } from '@/components/ui/primitives';
import { Question, QuestionGenerationPayload } from '@/lib/types';
import { toneCopy } from '@/lib/copy/tone';
import { requestJson } from '@/lib/client/request';
import { warnMalformedResponse } from '@/lib/client/response-warnings';

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationIssue, setGenerationIssue] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'answered' | 'dismissed'>('pending');

  useEffect(() => {
    setGenerationIssue(null);
    requestJson<Question[]>(`/api/projects/${id}/questions?status=${activeFilter === 'all' ? '' : activeFilter}`)
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data)) {
          setQuestions(data);
          setGenerationIssue(null);
        } else {
          if (ok) warnMalformedResponse('questions-page', 'questions list array response', data);
          setQuestions([]);
          setGenerationIssue('Failed to load questions.');
        }
        setLoading(false);
      })
      .catch(() => {
        setGenerationIssue('Failed to load questions.');
        setLoading(false);
      });
  }, [id, activeFilter]);

  const generateQuestions = async () => {
    setGenerating(true);
    setGenerationIssue(null);
    try {
      const { ok, data } = await requestJson<QuestionGenerationPayload>(`/api/projects/${id}/questions`, {
        method: 'POST',
        body: { action: 'generate' },
      });

      if (!ok || !data || !Array.isArray(data.questions)) {
        setGenerationIssue('Failed to generate questions. Please try again.');
        return;
      }

      setQuestions((prev) => [...data.questions, ...prev]);
      if (data.contractValidation && !data.contractValidation.isValid) {
        const issueCount = data.contractValidation.issues.length;
        const issueSummary =
          issueCount > 1
            ? `${data.contractValidation.issues[0]} (+${issueCount - 1} more)`
            : data.contractValidation.issues[0];
        setGenerationIssue(issueSummary || 'AI response contract was invalid for question generation.');
      }
    } catch {
      setGenerationIssue('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const setQuestionStatus = async (questionId: string, status: 'pending' | 'answered' | 'dismissed') => {
    try {
      const { ok, data } = await requestJson<Question>(`/api/projects/${id}/questions`, {
        method: 'POST',
        body: { action: 'update', questionId, status },
      });
      if (!ok || !data) {
        setGenerationIssue('Failed to update question status.');
        return;
      }
      setQuestions((prev) => prev.map((q) => (q.id === data.id ? data : q)));
    } catch {
      setGenerationIssue('Failed to update question status.');
    }
  };

  if (loading) {
    return (
      <Shell>
        <Container>
          <StatusMessage state="loading" title="Loading questions..." />
        </Container>
      </Shell>
    );
  }

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader
          title="Questions"
          actions={(
            <PrimaryButton onClick={generateQuestions} disabled={generating}>
              {generating ? 'Generating...' : '+ Generate More'}
            </PrimaryButton>
          )}
        />

        <Card className="mb-6">
          <p className="text-sm text-app-fg-muted">{toneCopy.questionsIntro}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['all', 'pending', 'answered', 'dismissed'] as const).map((filter) => (
              <SecondaryButton
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs ${
                  activeFilter === filter
                    ? 'border-neon-lime bg-neon-lime-dim text-neon-lime'
                    : ''
                }`}
              >
                {filter}
              </SecondaryButton>
            ))}
          </div>
        </Card>

        {generationIssue && (
          <div className="mb-6">
            <StatusMessage state="error" title={generationIssue} />
          </div>
        )}

        {questions.length === 0 ? (
          <StatusMessage state="empty" title={toneCopy.questionsEmpty} description="Generate questions from your material when you are ready." />
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={q.id} className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="font-mono text-sm text-app-fg-muted sm:w-6">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-app-fg">{q.text}</p>
                  <p className="mt-1 text-xs text-app-fg-muted">Status: {q.status}</p>
                  {q.sessionRef && (
                    <p className="mt-1 text-xs text-app-fg-muted">From session {q.sessionRef.slice(0, 8)}...</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <Link
                    href={`/project/${id}/record?questionId=${q.id}`}
                    className="text-xs text-neon-lime transition hover:text-neon-lime/80"
                  >
                    Answer →
                  </Link>
                  {q.status !== 'dismissed' && (
                    <button
                      onClick={() => setQuestionStatus(q.id, 'dismissed')}
                      className="text-[11px] text-app-fg-muted transition hover:text-app-fg"
                    >
                      Dismiss
                    </button>
                  )}
                  {q.status !== 'pending' && (
                    <button
                      onClick={() => setQuestionStatus(q.id, 'pending')}
                      className="text-[11px] text-app-fg-muted transition hover:text-app-fg"
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Shell>
  );
}
