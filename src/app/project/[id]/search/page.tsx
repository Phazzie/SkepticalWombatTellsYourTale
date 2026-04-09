'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, Shell, TextInput } from '@/components/ui/primitives';
import { requestJson } from '@/lib/client/request';

type SearchResponse = {
  query: string;
  results: Array<{ kind: string; id: string; title: string; snippet: string }>;
};

export default function SearchPage() {
  const { id } = useParams<{ id: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['results']>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchingRef = useRef(false);

  const runSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (searchingRef.current) return;
    searchingRef.current = true;
    setSearching(true);
    setError(null);
    try {
      const { ok, status, data } = await requestJson<SearchResponse>(
        `/api/projects/${id}/search?q=${encodeURIComponent(query.trim())}`
      );
      if (!ok) {
        setError(`Search failed (${status})`);
        setResults([]);
        return;
      }
      if (!data || !Array.isArray(data.results)) {
        setError('Unable to load search results. Please try again.');
        setResults([]);
        return;
      }
      setResults(data.results);
    } catch {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      searchingRef.current = false;
      setSearching(false);
    }
  };

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title="🔎 Search" subtitle="Search sessions, docs, concepts, and questions." />

        <Card className="space-y-3">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !searchingRef.current && runSearch()}
            placeholder="Search project content..."
          />
          <PrimaryButton onClick={runSearch} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </PrimaryButton>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </Card>

        <div className="mt-4 space-y-2">
          {results.map((result) => (
            <Card key={`${result.kind}:${result.id}`}>
              <p className="text-xs uppercase text-app-fg-muted">{result.kind}</p>
              <p className="text-sm text-app-fg">{result.title}</p>
              {result.snippet && <p className="text-xs text-app-fg-muted mt-1">{result.snippet}</p>}
            </Card>
          ))}
        </div>
      </Container>
    </Shell>
  );
}
