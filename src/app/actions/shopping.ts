'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addShoppingItems,
  toggleShoppingItem,
  removeShoppingItem,
  removeShoppingByIngredient,
  clearCheckedShopping,
  clearAllShopping,
} from '@/data/mutations';
import { authActionClient } from '@/lib/safe-action';

const addItemsSchema = z.object({
  recipeId: z.number(),
  recipeUid: z.string(),
  recipeTitle: z.string(),
  ingredients: z.array(z.object({ id: z.number(), name: z.string(), amount: z.string() })),
});

const removeByIngSchema = z.object({
  recipeId: z.number(),
  recipeUid: z.string(),
  ingredientId: z.number(),
});

const itemIdSchema = z.object({ id: z.number() });

export const addShoppingItemsAction = authActionClient
  .inputSchema(addItemsSchema)
  .action(async ({ parsedInput: { recipeId, recipeUid, recipeTitle, ingredients } }) => {
    await addShoppingItems(
      ingredients.map(ing => ({
        recipeId,
        recipeUid,
        recipeTitle,
        ingredientId: ing.id,
        name: ing.name,
        amount: ing.amount,
        checked: false,
      }))
    );
    revalidatePath('/shopping');
    revalidatePath(`/recipes/${recipeUid}`);
    revalidatePath('/');
  });

export const removeShoppingByIngredientAction = authActionClient
  .inputSchema(removeByIngSchema)
  .action(async ({ parsedInput: { recipeId, recipeUid, ingredientId } }) => {
    await removeShoppingByIngredient(recipeId, ingredientId);
    revalidatePath('/shopping');
    revalidatePath(`/recipes/${recipeUid}`);
    revalidatePath('/');
  });

export const toggleShoppingItemAction = authActionClient
  .inputSchema(itemIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    await toggleShoppingItem(id);
    revalidatePath('/shopping');
  });

export const removeShoppingItemAction = authActionClient
  .inputSchema(itemIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    await removeShoppingItem(id);
    revalidatePath('/shopping');
    revalidatePath('/');
  });

export const clearCheckedShoppingAction = authActionClient
  .action(async () => {
    await clearCheckedShopping();
    revalidatePath('/shopping');
    revalidatePath('/');
  });

export const clearAllShoppingAction = authActionClient
  .action(async () => {
    await clearAllShopping();
    revalidatePath('/shopping');
    revalidatePath('/');
  });
