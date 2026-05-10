'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createRecipe, updateRecipe, deleteRecipe } from '@/data/mutations';
import { authActionClient } from '@/lib/safe-action';

const recipeFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  notes: z.string(),
  types: z.array(z.enum(['starter', 'main', 'dessert', 'italian', 'asian'])),
  ingredients: z.array(z.object({ id: z.number(), amount: z.string(), name: z.string() })),
  steps: z.array(z.object({ id: z.number(), order: z.number(), description: z.string() })),
});

const updateRecipeSchema = recipeFormSchema.extend({ id: z.number(), uid: z.string() });
const deleteRecipeSchema = z.object({ id: z.number() });

export const createRecipeAction = authActionClient
  .inputSchema(recipeFormSchema)
  .action(async ({ parsedInput }) => {
    const uid = await createRecipe(parsedInput);
    revalidatePath('/');
    redirect(`/recipes/${uid}`);
  });

export const updateRecipeAction = authActionClient
  .inputSchema(updateRecipeSchema)
  .action(async ({ parsedInput: { id, uid, ...data } }) => {
    await updateRecipe(id, data);
    revalidatePath('/');
    revalidatePath(`/recipes/${uid}`);
    redirect(`/recipes/${uid}`);
  });

export const deleteRecipeAction = authActionClient
  .inputSchema(deleteRecipeSchema)
  .action(async ({ parsedInput: { id } }) => {
    await deleteRecipe(id);
    revalidatePath('/');
    redirect('/');
  });
