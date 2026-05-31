'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, PrimaryButton, SecondaryButton, TextInput } from '@/components/ui/primitives';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/');
        router.refresh();
        return;
      }

      setError('Invalid email or password');
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-3">
          <PrimaryButton type="submit" disabled={loading} className="flex-1">
            {loading ? 'Signing in...' : 'Sign in'}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={() => router.push('/register')}
            className="flex-1"
          >
            Create account
          </SecondaryButton>
        </div>
      </form>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || 'Registration failed');
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!signInResult?.ok) {
        setError('Account created, but sign-in failed. Try signing in manually.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextInput
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextInput
          type="password"
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-3">
          <PrimaryButton type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create account'}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={() => router.push('/sign-in')}
            className="flex-1"
          >
            Sign in
          </SecondaryButton>
        </div>
      </form>
    </Card>
  );
}
