import { getRecipe } from '@/data/store';
import RecipeForm from '@/features/recipes/RecipeForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  return <RecipeForm initial={recipe} />;
}
