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
    <div className="mt-6 rounded-2xl border border-app-border bg-app-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔎</span>
        <h2 className="font-semibold text-white">Search Across Everything</h2>
        <span className="ml-auto rounded-md border border-app-border bg-app-surface-muted px-2 py-1 text-[11px] text-app-fg-muted">⌘K</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          aria-label="Search project content"
          placeholder="Search sessions, docs, concepts, questions..."
          className="flex-1 rounded-xl border border-app-border bg-app-surface-muted px-3 py-2 text-sm text-app-fg placeholder:text-app-fg-muted"
        />
        <button
          onClick={onSearch}
          className="rounded-xl bg-app-accent px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:brightness-110"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
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
    </div>
  );
}
