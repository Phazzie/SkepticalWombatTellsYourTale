import { Shell, Container } from '@/components/ui/primitives';
import { AppHeader } from '@/components/layout/app-header';
import { SignInForm } from '@/components/auth/auth-forms';

export default function SignInPage() {
  return (
    <Shell>
      <Container>
        <AppHeader title="Sign in" subtitle="Access your private storytelling workspace." />
        <SignInForm />
      </Container>
    </Shell>
  );
}
