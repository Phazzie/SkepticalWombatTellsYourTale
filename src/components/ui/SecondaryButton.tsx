import { ButtonHTMLAttributes } from 'react';

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-app-surface-strong disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
    />
  );
}
