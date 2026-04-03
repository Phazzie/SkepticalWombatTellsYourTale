'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

  useEffect(() => {
    fetch(`/api/projects/${id}/questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const generateQuestions = async () => {
    setGenerating(true);
    const res = await fetch(`/api/projects/${id}/questions`, { method: 'POST' });
    const data = await res.json();
    setQuestions((prev) => [...data, ...prev]);
    setGenerating(false);
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
            These are specific questions based on what you&apos;ve said — not generic prompts. Answer any of them
            by recording a new voice session.
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">❓</div>
            <p>No questions yet.</p>
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
                  {q.sessionRef && (
                    <p className="text-xs text-gray-600 mt-1">From session {q.sessionRef.slice(0, 8)}...</p>
                  )}
                </div>
                <Link
                  href={`/project/${id}/record`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0"
                >
                  Answer →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
