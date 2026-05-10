import { getShopping, getRecipes } from '@/data/queries';
import { getUser } from '@/lib/auth';
import MastheadShell from './MastheadShell';

export default async function Masthead() {
  const [shopping, recipes, user] = await Promise.all([
    getShopping(),
    getRecipes(),
    getUser(),
  ]);
  const pendingCount = shopping.filter(it => !it.checked).length;
  const totalCount = recipes.length;
  const lastDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const userName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? null;

  return (
    <MastheadShell
      pendingCount={pendingCount}
      totalCount={totalCount}
      lastDate={lastDate}
      userEmail={user?.email ?? null}
      userName={userName}
    />
  );
}
