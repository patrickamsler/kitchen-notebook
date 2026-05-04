'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createRecipe, updateRecipe, deleteRecipe } from '@/data/store';
import { uid } from '@/lib/uid';
import type { Recipe, RecipeType, Ingredient, Step } from '@/lib/types';

function parseRecipeForm(formData: FormData, existingId?: string, existingCreatedAt?: string): Recipe {
  const title = (formData.get('title') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const notes = (formData.get('notes') as string | null)?.trim() ?? '';
  const types = formData.getAll('types') as RecipeType[];

  const ingredientIds = formData.getAll('ingredient_id') as string[];
  const ingredientAmounts = formData.getAll('ingredient_amount') as string[];
  const ingredientNames = formData.getAll('ingredient_name') as string[];

  const ingredients: Ingredient[] = ingredientIds
    .map((id, i) => ({
      id,
      amount: (ingredientAmounts[i] ?? '').trim(),
      name: (ingredientNames[i] ?? '').trim(),
    }))
    .filter(ing => ing.name.length > 0 || ing.amount.length > 0);

  const stepIds = formData.getAll('step_id') as string[];
  const stepDescriptions = formData.getAll('step_description') as string[];

  const steps: Step[] = stepIds
    .map((id, i) => ({
      id,
      order: i + 1,
      description: (stepDescriptions[i] ?? '').trim(),
    }))
    .filter(s => s.description.length > 0);

  return {
    id: existingId ?? uid(),
    title,
    types,
    description,
    ingredients,
    steps,
    notes,
    createdAt: existingCreatedAt ?? new Date().toISOString(),
  };
}

export async function createRecipeAction(formData: FormData) {
  const recipe = parseRecipeForm(formData);
  if (!recipe.title) return;
  await createRecipe(recipe);
  revalidatePath('/');
  redirect(`/recipes/${recipe.id}`);
}

export async function updateRecipeAction(id: string, createdAt: string, formData: FormData) {
  const recipe = parseRecipeForm(formData, id, createdAt);
  if (!recipe.title) return;
  await updateRecipe(recipe);
  revalidatePath('/');
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipeAction(id: string) {
  await deleteRecipe(id);
  revalidatePath('/');
  redirect('/');
}
