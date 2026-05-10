import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import RecipeForm from '@/features/recipes/RecipeForm';

export default async function NewRecipePage() {
  const user = await getUser();
  if (!user) redirect('/login?redirect=/recipes/new');
  return <RecipeForm initial={null} />;
}
