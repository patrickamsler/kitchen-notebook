import { redirect } from 'next/navigation';
import { getRecipe } from '@/data/queries';
import { getUser } from '@/lib/auth';
import RecipeForm from '@/features/recipes/RecipeForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?redirect=/recipes/${id}/edit`);
  const recipe = await getRecipe(id);
  return <RecipeForm initial={recipe} />;
}
