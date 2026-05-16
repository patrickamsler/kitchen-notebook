import { getShopping } from '@/data/queries';
import { getUser } from '@/lib/auth';
import MastheadShell from './MastheadShell';

export default async function Masthead() {
  const user = await getUser();

  const pendingCount = user
    ? await getShopping().then(items => items.filter(it => !it.checked).length)
    : 0;

  const userName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? null;

  return (
    <MastheadShell
      pendingCount={pendingCount}
      userEmail={user?.email ?? null}
      userName={userName}
    />
  );
}
