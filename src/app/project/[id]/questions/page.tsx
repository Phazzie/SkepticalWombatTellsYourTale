'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, Shell, StatusMessage } from '@/components/ui/primitives';

interface Question {
  text: string;
  sessionRef?: string;
  createdAt: string;
}

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}/questions`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load questions');
        return r.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setLoading(false);
      });
  }, [id]);

  const generateQuestions = async () => {
    setGenerating(true);
    setError(null);

    const res = await fetch(`/api/projects/${id}/questions`, { method: 'POST' });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Failed to generate questions');
      setGenerating(false);
      return;
    }

    const data = await res.json();
    setQuestions((prev) => [...data, ...prev]);
    setGenerating(false);
  };

  if (loading) {
    return <Shell><Container><StatusMessage state="loading" title="Loading questions..." /></Container></Shell>;
  }

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader
          title="Questions"
          subtitle="Specific prompts based on your sessions and documents."
          actions={
            <PrimaryButton onClick={generateQuestions} disabled={generating}>
              {generating ? 'Generating...' : '+ Generate More'}
            </PrimaryButton>
          }
        />

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {questions.length === 0 ? (
          <StatusMessage state="empty" title="No questions yet" description="Generate questions from your project material." />
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={i} className="flex items-start gap-4">
                <span className="w-6 font-mono text-sm text-app-fg-muted">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-app-fg">{q.text}</p>
                  {q.sessionRef && (
                    <p className="mt-1 text-xs text-app-fg-muted">From session {q.sessionRef.slice(0, 8)}...</p>
                  )}
                </div>
                <Link href={`/project/${id}/record`} className="shrink-0 text-xs text-indigo-300 hover:text-indigo-200">
                  Answer →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Shell>
  );
}
