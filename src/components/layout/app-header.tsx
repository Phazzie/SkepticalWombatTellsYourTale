import { ReactNode } from 'react';
import { WombatMark } from '@/components/ui/primitives';

export function AppHeader({
  title,
  subtitle,
  actions,
  showMark = false,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showMark?: boolean;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        {showMark && (
          <div className="shrink-0 rounded-2xl bg-app-surface-muted p-2 border border-neon-lime/20 glow-lime">
            <WombatMark size={40} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-app-fg-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
