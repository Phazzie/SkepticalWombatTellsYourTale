import { ProjectSearchResult } from '@/components/project/dashboard/types';

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
    <div className="mt-4 rounded-2xl border border-app-border bg-app-surface p-5 shadow-app">
      <h2 className="font-semibold text-white mb-3">Search Across Everything</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => !searching && e.key === 'Enter' && onSearch()}
          aria-label="Search project content"
          placeholder="Search sessions, docs, concepts, questions..."
          className="flex-1 rounded-xl border border-app-border bg-app-surface-muted px-4 py-2.5 text-sm text-app-fg placeholder:text-app-fg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime focus-visible:border-neon-lime/50"
        />
        <button
          onClick={onSearch}
          disabled={searching}
          className="rounded-xl bg-app-surface-muted border border-app-border px-4 py-2.5 text-sm text-app-fg hover:bg-app-surface-strong hover:border-app-border-strong transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {searchResults.slice(0, 10).map((r) => (
            <div key={`${r.kind}:${r.id}`} className="rounded-xl bg-app-surface-muted p-3 border border-app-border">
              <p className="text-xs text-app-fg-muted uppercase tracking-wide mb-0.5">{r.kind}</p>
              <p className="text-sm text-white">{r.title}</p>
              {r.snippet && <p className="text-xs text-app-fg-muted mt-1">{r.snippet}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
