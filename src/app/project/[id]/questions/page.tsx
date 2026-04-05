'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Question, QuestionGenerationPayload } from '@/lib/types';
import { toneCopy } from '@/lib/copy/tone';
import { requestJson } from '@/lib/client/request';

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationIssue, setGenerationIssue] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'answered' | 'dismissed'>('pending');

  useEffect(() => {
    requestJson<Question[]>(`/api/projects/${id}/questions?status=${activeFilter === 'all' ? '' : activeFilter}`)
      .then(({ data }) => data)
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, activeFilter]);

  const generateQuestions = async () => {
    setGenerating(true);
    setGenerationIssue(null);
    const { data } = await requestJson<QuestionGenerationPayload>(`/api/projects/${id}/questions`, {
      method: 'POST',
      body: { action: 'generate' },
    });
    setQuestions((prev) => [...data.questions, ...prev]);
    if (data.contractValidation && !data.contractValidation.isValid) {
      const issueCount = data.contractValidation.issues.length;
      const issueSummary =
        issueCount > 1
          ? `${data.contractValidation.issues[0]} (+${issueCount - 1} more)`
          : data.contractValidation.issues[0];
      setGenerationIssue(issueSummary || 'AI response contract was invalid for question generation.');
    }
    setGenerating(false);
  };

  const setQuestionStatus = async (questionId: string, status: 'pending' | 'answered' | 'dismissed') => {
    const { ok, data } = await requestJson<Question>(`/api/projects/${id}/questions`, {
      method: 'POST',
      body: { action: 'update', questionId, status },
    });
    if (!ok) return;
    setQuestions((prev) => prev.map((q) => (q.id === data.id ? data : q)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/project/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Questions</h1>
          <button
            onClick={generateQuestions}
            disabled={generating}
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {generating ? 'Generating...' : '+ Generate More'}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
            <p className="text-gray-400 text-sm">
              {toneCopy.questionsIntro}
            </p>
          <div className="flex gap-2 mt-3">
            {(['all', 'pending', 'answered', 'dismissed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  activeFilter === filter
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {generationIssue && (
          <div className="mb-6 rounded-xl border border-amber-700 bg-amber-900/20 p-4 text-sm text-amber-300">
            {generationIssue}
          </div>
        )}

        {questions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">❓</div>
            <p>{toneCopy.questionsEmpty}</p>
            <button onClick={generateQuestions} className="text-indigo-400 hover:text-indigo-300 mt-2">
              Generate questions from your material →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-start gap-4">
                <span className="text-gray-600 text-sm mt-0.5 font-mono w-6">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-gray-200">{q.text}</p>
                  <p className="text-xs text-gray-500 mt-1">Status: {q.status}</p>
                  {q.sessionRef && (
                    <p className="text-xs text-gray-600 mt-1">From session {q.sessionRef.slice(0, 8)}...</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/project/${id}/record?questionId=${q.id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0"
                  >
                    Answer →
                  </Link>
                  {q.status !== 'dismissed' && (
                    <button
                      onClick={() => setQuestionStatus(q.id, 'dismissed')}
                      className="text-[11px] text-gray-500 hover:text-gray-300"
                    >
                      Dismiss
                    </button>
                  )}
                  {q.status !== 'pending' && (
                    <button
                      onClick={() => setQuestionStatus(q.id, 'pending')}
                      className="text-[11px] text-gray-500 hover:text-gray-300"
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
