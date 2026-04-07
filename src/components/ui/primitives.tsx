import Link from 'next/link';
import { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-app-bg text-app-fg">{children}</div>;
}

export function Container({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${wide ? 'max-w-5xl' : 'max-w-4xl'} mx-auto px-6 py-8`}>{children}</div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-app-border bg-app-surface p-5 shadow-app ${className}`}>
      {children}
    </div>
  );
}

/** Glassmorphic card — use for prominent panels */
export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 shadow-app glass-soft ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-xl bg-neon-lime px-4 py-2 text-sm font-semibold text-black transition duration-200 hover:brightness-110 glow-lime disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime ${className}`}
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
      className={`w-full rounded-xl border border-app-border bg-app-surface-muted px-4 py-2.5 text-sm text-app-fg placeholder:text-app-fg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime focus-visible:border-neon-lime/50 ${className}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', 'aria-label': ariaLabel, ...rest } = props;
  return (
    <textarea
      {...rest}
      aria-label={ariaLabel ?? rest.placeholder ?? 'Text area'}
      className={`w-full rounded-xl border border-app-border bg-app-surface-muted px-4 py-2.5 text-sm text-app-fg placeholder:text-app-fg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime focus-visible:border-neon-lime/50 ${className}`}
    />
  );
}

export function AppBackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-app-fg-muted transition hover:text-neon-lime">
      <span aria-hidden>←</span> {label}
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
  const styles = {
    empty:   'text-app-fg-muted',
    loading: 'text-app-fg-muted',
    error:   'text-neon-pink',
    success: 'text-neon-lime',
  } as const;

  const dots = state === 'loading' ? (
    <span className="inline-flex gap-1 ml-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60 loading-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  ) : null;

  return (
    <Card className="text-center">
      <p className={`text-lg font-semibold ${styles[state]}`}>
        {title}{dots}
      </p>
      {description && <p className="mt-2 text-sm text-app-fg-muted">{description}</p>}
    </Card>
  );
}

/** Inline wombat SVG mark — minimalist line art, neon lime */
export function WombatMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Skeptical Wombat"
      role="img"
    >
      {/* Left ear */}
      <path d="M11 19 Q9 11 13.5 11.5 Q17 12 15.5 19" stroke="#a3e635" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right ear */}
      <path d="M37 19 Q39 11 34.5 11.5 Q31 12 32.5 19" stroke="#a3e635" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Head — wide wombat skull */}
      <ellipse cx="24" cy="27" rx="17" ry="13" stroke="#a3e635" strokeWidth="1.6" />
      {/* Left eyebrow — raised (skeptical) */}
      <path d="M13.5 21.5 Q16.5 17.5 20 19" stroke="#a3e635" strokeWidth="1.6" strokeLinecap="round" />
      {/* Right eyebrow — level */}
      <path d="M28 19.5 Q31.5 19 35 20.5" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" />
      {/* Left eye */}
      <circle cx="17.5" cy="24" r="1.8" fill="#a3e635" />
      {/* Right eye */}
      <circle cx="30.5" cy="24" r="1.8" fill="#a3e635" />
      {/* Neon lime eye glow on left eye */}
      <circle cx="17.5" cy="24" r="3.5" fill="rgba(163,230,53,0.15)" />
      {/* Broad flat nose pad */}
      <rect x="19.5" y="28.5" width="9" height="5.5" rx="2.75" stroke="#a3e635" strokeWidth="1.4" opacity="0.75" />
      {/* Nostrils */}
      <circle cx="22" cy="31.2" r="0.9" fill="#a3e635" opacity="0.8" />
      <circle cx="26" cy="31.2" r="0.9" fill="#a3e635" opacity="0.8" />
      {/* Smirk — slight, one-sided */}
      <path d="M19 37 Q22 39 27.5 37.5" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
