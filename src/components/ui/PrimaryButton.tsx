import { ButtonHTMLAttributes } from 'react';

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-xl bg-neon-lime px-4 py-2 text-sm font-semibold text-black transition duration-200 hover:brightness-110 glow-lime disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime ${className}`}
    />
  );
}
