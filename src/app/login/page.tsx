import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import LoginForm from '@/features/auth/LoginForm';

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const user = await getUser();
  if (user) redirect('/');
  const params = await searchParams;
  const redirectTo = params.redirect && params.redirect.startsWith('/') ? params.redirect : undefined;
  return <LoginForm redirectTo={redirectTo} />;
}
