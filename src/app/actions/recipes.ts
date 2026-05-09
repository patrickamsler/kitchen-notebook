'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createRecipe, updateRecipe, deleteRecipe } from '@/data/store';
import type { RecipeType, Ingredient, Step } from '@/lib/types';

function parseRecipeForm(formData: FormData) {
  const title = (formData.get('title') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const notes = (formData.get('notes') as string | null)?.trim() ?? '';
  const types = formData.getAll('types') as RecipeType[];

  const ingredientIds = formData.getAll('ingredient_id').map(v => parseInt(v as string, 10));
  const ingredientAmounts = formData.getAll('ingredient_amount') as string[];
  const ingredientNames = formData.getAll('ingredient_name') as string[];

  const ingredients: Ingredient[] = ingredientIds
    .map((id, i) => ({
      id,
      amount: (ingredientAmounts[i] ?? '').trim(),
      name: (ingredientNames[i] ?? '').trim(),
    }))
    .filter(ing => ing.name.length > 0 || ing.amount.length > 0);

  const stepIds = formData.getAll('step_id').map(v => parseInt(v as string, 10));
  const stepDescriptions = formData.getAll('step_description') as string[];

  const steps: Step[] = stepIds
    .map((id, i) => ({
      id,
      order: i + 1,
      description: (stepDescriptions[i] ?? '').trim(),
    }))
    .filter(s => s.description.length > 0);

  return { title, description, notes, types, ingredients, steps };
}

export async function createRecipeAction(formData: FormData) {
  const data = parseRecipeForm(formData);
  if (!data.title) return;
  const uid = await createRecipe(data);
  revalidatePath('/');
  redirect(`/recipes/${uid}`);
}

export async function updateRecipeAction(id: number, uid: string, formData: FormData) {
  const data = parseRecipeForm(formData);
  if (!data.title) return;
  await updateRecipe(id, data);
  revalidatePath('/');
  revalidatePath(`/recipes/${uid}`);
  redirect(`/recipes/${uid}`);
}

export async function deleteRecipeAction(id: number) {
  await deleteRecipe(id);
  revalidatePath('/');
  redirect('/');
}
