import { getShopping, getRecipes } from '@/data/queries';
import MastheadShell from './MastheadShell';

export default async function Masthead() {
  const [shopping, recipes] = await Promise.all([getShopping(), getRecipes()]);
  const pendingCount = shopping.filter(it => !it.checked).length;
  const totalCount = recipes.length;
  const lastDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <MastheadShell
      pendingCount={pendingCount}
      totalCount={totalCount}
      lastDate={lastDate}
    />
  );
}
