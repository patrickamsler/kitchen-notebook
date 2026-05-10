import { getRecipe, getShopping } from '@/data/queries';
import { getUser } from '@/lib/auth';
import RecipeDetailClient from '@/features/recipes/RecipeDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const [recipe, shopping, user] = await Promise.all([
    getRecipe(id),
    getShopping(),
    getUser(),
  ]);
  const shoppingItems = shopping.filter(s => s.recipeId === recipe.id);

  return (
    <RecipeDetailClient
      recipe={recipe}
      shoppingItems={shoppingItems}
      isAuthenticated={!!user}
    />
  );
}
