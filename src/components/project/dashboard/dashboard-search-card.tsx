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
    <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔎</span>
        <h2 className="font-semibold text-white">Search Across Everything</h2>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          aria-label="Search project content"
          placeholder="Search sessions, docs, concepts, questions..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500"
        />
        <button
          onClick={onSearch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className="mt-3 space-y-2">
          {searchResults.slice(0, 10).map((r) => (
            <div key={`${r.kind}:${r.id}`} className="bg-gray-800 rounded p-3">
              <p className="text-xs text-gray-500 uppercase">{r.kind}</p>
              <p className="text-sm text-gray-200">{r.title}</p>
              {r.snippet && <p className="text-xs text-gray-400 mt-1">{r.snippet}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
