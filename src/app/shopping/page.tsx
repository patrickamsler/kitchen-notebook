import { getShopping } from '@/data/queries';
import ShoppingList from '@/features/shopping/ShoppingList';

export default async function ShoppingPage() {
  const items = await getShopping();
  return <ShoppingList items={items} />;
}
