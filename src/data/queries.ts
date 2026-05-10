import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Recipe, RecipeType, Ingredient, Step, ShoppingItem } from '@/lib/types';

function mapRecipe(row: Record<string, unknown>): Recipe {
  const types = (row.recipe_types as { type_id: string }[]).map(rt => rt.type_id as RecipeType);
  const ingredients = (row.ingredients as { id: number; amount: string; name: string }[]);
  const steps = (row.steps as { id: number; order: number; description: string }[]);
  return {
    id: row.id as number,
    uid: row.uid as string,
    title: row.title as string,
    description: row.description as string,
    notes: row.notes as string,
    createdAt: row.created_at as string,
    types,
    ingredients,
    steps: [...steps].sort((a, b) => a.order - b.order),
  };
}

const RECIPE_SELECT = `
  id, uid, title, description, notes, created_at,
  recipe_types ( type_id ),
  ingredients ( id, amount, name ),
  steps ( id, order, description )
`;

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[]).map(mapRecipe);
}

export async function getRecipe(uid: string): Promise<Recipe> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .eq('uid', uid)
    .single();
  if (error) throw new Error('Recipe not found');
  return mapRecipe(data as Record<string, unknown>);
}

export async function getShopping(): Promise<ShoppingItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .order('added_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[]).map(row => ({
    id: row.id as number,
    recipeId: row.recipe_id as number,
    recipeUid: row.recipe_uid as string,
    recipeTitle: row.recipe_title as string,
    ingredientId: row.ingredient_id as number,
    name: row.name as string,
    amount: row.amount as string,
    checked: row.checked as boolean,
    addedAt: row.added_at as string,
  }));
}
