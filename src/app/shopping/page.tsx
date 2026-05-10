import { getShopping } from '@/data/queries';
import { getUser } from '@/lib/auth';
import ShoppingList from '@/features/shopping/ShoppingList';

export default async function ShoppingPage() {
  const [items, user] = await Promise.all([getShopping(), getUser()]);
  return <ShoppingList items={items} isAuthenticated={!!user} />;
}
