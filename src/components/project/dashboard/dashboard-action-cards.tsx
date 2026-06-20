import Link from 'next/link';
import { GlassCard } from '@/components/ui/primitives';

export function DashboardActionCards({
  id,
  documentCount,
  sessionCount,
}: {
  id: string;
  documentCount: number;
  sessionCount: number;
}) {
  const cards = [
    { href: `/project/${id}/record`, icon: '🎙️', label: 'Record', detail: 'Voice session', featured: true },
    { href: `/project/${id}/documents`, icon: '📄', label: 'Documents', detail: `${documentCount} ${documentCount === 1 ? 'doc' : 'docs'}` },
    { href: `/project/${id}/sessions`, icon: '📼', label: 'Sessions', detail: `${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'}` },
    { href: `/project/${id}/export`, icon: '📤', label: 'Export', detail: 'Export work' },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.href} href={card.href} className="group block">
          <GlassCard
            className={`h-full p-5 text-center transition group-hover:border-neon-lime/40 ${
              card.featured ? 'border-neon-lime/30 bg-neon-lime-dim' : ''
            }`}
          >
            <div className="mb-2 text-3xl">{card.icon}</div>
            <div className="font-semibold text-app-fg">{card.label}</div>
            <div className="mt-1 text-xs text-app-fg-muted">{card.detail}</div>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}
