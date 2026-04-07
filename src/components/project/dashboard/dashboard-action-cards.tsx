import Link from 'next/link';

export function DashboardActionCards({
  id,
  documentCount,
  sessionCount,
}: {
  id: string;
  documentCount: number;
  sessionCount: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Link
        href={`/project/${id}/record`}
        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl p-5 text-center transition-colors"
      >
        <div className="text-3xl mb-2">🎙️</div>
        <div className="font-semibold">Record</div>
        <div className="text-indigo-300 text-xs mt-1">Voice session</div>
      </Link>
      <Link
        href={`/project/${id}/documents`}
        className="bg-gray-800 hover:bg-gray-700 rounded-xl p-5 text-center transition-colors"
      >
        <div className="text-3xl mb-2">📄</div>
        <div className="font-semibold">Documents</div>
        <div className="text-gray-400 text-xs mt-1">{documentCount} {documentCount === 1 ? 'doc' : 'docs'}</div>
      </Link>
      <Link
        href={`/project/${id}/sessions`}
        className="bg-gray-800 hover:bg-gray-700 rounded-xl p-5 text-center transition-colors"
      >
        <div className="text-3xl mb-2">📼</div>
        <div className="font-semibold">Sessions</div>
        <div className="text-gray-400 text-xs mt-1">{sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}</div>
      </Link>
      <Link
        href={`/project/${id}/export`}
        className="bg-gray-800 hover:bg-gray-700 rounded-xl p-5 text-center transition-colors"
      >
        <div className="text-3xl mb-2">📤</div>
        <div className="font-semibold">Export</div>
        <div className="text-gray-400 text-xs mt-1">Export work</div>
      </Link>
    </div>
  );
}
