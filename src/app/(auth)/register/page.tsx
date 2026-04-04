import { Shell, Container } from '@/components/ui/primitives';
import { AppHeader } from '@/components/layout/app-header';
import { RegisterForm } from '@/components/auth/auth-forms';

export default function RegisterPage() {
  return (
    <Shell>
      <Container>
        <AppHeader title="Create account" subtitle="Private by default. Your projects are scoped to your account." />
        <RegisterForm />
      </Container>
    </Shell>
  );
}
