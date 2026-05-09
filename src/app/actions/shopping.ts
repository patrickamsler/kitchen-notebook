'use server';

import { revalidatePath } from 'next/cache';
import {
  addShoppingItems,
  toggleShoppingItem,
  removeShoppingItem,
  removeShoppingByIngredient,
  clearCheckedShopping,
  clearAllShopping,
} from '@/data/store';

export async function addShoppingItemsAction(
  recipeId: number,
  recipeUid: string,
  recipeTitle: string,
  ingredients: Array<{ id: number; name: string; amount: string }>
) {
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
}

export async function removeShoppingByIngredientAction(
  recipeId: number,
  recipeUid: string,
  ingredientId: number
) {
  await removeShoppingByIngredient(recipeId, ingredientId);
  revalidatePath('/shopping');
  revalidatePath(`/recipes/${recipeUid}`);
  revalidatePath('/');
}

export async function toggleShoppingItemAction(itemId: number) {
  await toggleShoppingItem(itemId);
  revalidatePath('/shopping');
}

export async function removeShoppingItemAction(itemId: number) {
  await removeShoppingItem(itemId);
  revalidatePath('/shopping');
  revalidatePath('/');
}

export async function clearCheckedShoppingAction() {
  await clearCheckedShopping();
  revalidatePath('/shopping');
  revalidatePath('/');
}

export async function clearAllShoppingAction() {
  await clearAllShopping();
  revalidatePath('/shopping');
  revalidatePath('/');
}
