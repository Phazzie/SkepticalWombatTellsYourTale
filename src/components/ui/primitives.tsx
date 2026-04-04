import Link from 'next/link';
import { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-app-bg text-app-fg">{children}</div>;
}

export function Container({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${wide ? 'max-w-5xl' : 'max-w-4xl'} mx-auto px-6 py-8`}>{children}</div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-app-border bg-app-surface p-5 shadow-app ${className}`}>{children}</div>;
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-xl bg-app-accent px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:brightness-110 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent ${className}`}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-xl border border-app-border bg-app-surface-muted px-4 py-2 text-sm font-semibold text-app-fg transition duration-200 hover:border-app-border-strong hover:bg-app-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent ${className}`}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', 'aria-label': ariaLabel, ...rest } = props;
  return (
    <input
      {...rest}
      aria-label={ariaLabel ?? rest.placeholder ?? 'Text input'}
      className={`w-full rounded-xl border border-app-border bg-app-surface-muted px-4 py-2 text-sm text-app-fg placeholder:text-app-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent ${className}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', 'aria-label': ariaLabel, ...rest } = props;
  return (
    <textarea
      {...rest}
      aria-label={ariaLabel ?? rest.placeholder ?? 'Text area'}
      className={`w-full rounded-xl border border-app-border bg-app-surface-muted px-4 py-2 text-sm text-app-fg placeholder:text-app-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent ${className}`}
    />
  );
}

export function AppBackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="text-sm text-app-fg-muted transition hover:text-app-fg">
      ← {label}
    </Link>
  );
}

export function StatusMessage({
  state,
  title,
  description,
}: {
  state: 'empty' | 'loading' | 'error' | 'success';
  title: string;
  description?: string;
}) {
  const colorByState = {
    empty: 'text-app-fg-muted',
    loading: 'text-app-fg-muted',
    error: 'text-red-300',
    success: 'text-emerald-300',
  } as const;

  return (
    <Card className="text-center">
      <p className={`text-lg font-semibold ${colorByState[state]}`}>{title}</p>
      {description && <p className="mt-2 text-sm text-app-fg-muted">{description}</p>}
    </Card>
  );
}
