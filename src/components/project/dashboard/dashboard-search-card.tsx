import { ProjectSearchResult } from '@/components/project/dashboard/types';
import { Card, PrimaryButton, TextInput } from '@/components/ui/primitives';

export function DashboardSearchCard({
  searchTerm,
  searching,
  searchResults,
  onSearchTermChange,
  onSearch,
}: {
  searchTerm: string;
  searching: boolean;
  searchResults: ProjectSearchResult[];
  onSearchTermChange: (value: string) => void;
  onSearch: () => Promise<void>;
}) {
  return (
    <Card className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🔎</span>
        <h2 className="font-semibold text-app-fg">Search Across Everything</h2>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextInput
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !searching && onSearch()}
          disabled={searching}
          aria-label="Search project content"
          aria-busy={searching}
          placeholder="Search sessions, docs, concepts, questions..."
          className="flex-1"
        />
        <PrimaryButton
          onClick={onSearch}
          disabled={searching}
          aria-busy={searching}
          className="disabled:cursor-not-allowed"
        >
          {searching ? 'Searching...' : 'Search'}
        </PrimaryButton>
      </div>
      {searchResults.length > 0 && (
        <div className="mt-3 space-y-2">
          {searchResults.slice(0, 10).map((r) => (
            <div key={`${r.kind}:${r.id}`} className="rounded-xl border border-app-border bg-app-surface-muted p-3">
              <p className="text-xs uppercase text-app-fg-muted">{r.kind}</p>
              <p className="text-sm text-app-fg">{r.title}</p>
              {r.snippet && <p className="mt-1 text-xs text-app-fg-muted">{r.snippet}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
