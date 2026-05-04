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
import type { ShoppingItem } from '@/lib/types';
import { uid } from '@/lib/uid';

export async function addShoppingItemsAction(
  recipeId: string,
  recipeTitle: string,
  ingredients: Array<{ id: string; name: string; amount: string }>
) {
  const items: ShoppingItem[] = ingredients.map(ing => ({
    id: uid(),
    recipeId,
    recipeTitle,
    ingredientId: ing.id,
    name: ing.name,
    amount: ing.amount,
    checked: false,
    addedAt: new Date().toISOString(),
  }));
  await addShoppingItems(items);
  revalidatePath('/shopping');
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/');
}

export async function removeShoppingByIngredientAction(recipeId: string, ingredientId: string) {
  await removeShoppingByIngredient(recipeId, ingredientId);
  revalidatePath('/shopping');
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath('/');
}

export async function toggleShoppingItemAction(itemId: string) {
  await toggleShoppingItem(itemId);
  revalidatePath('/shopping');
}

export async function removeShoppingItemAction(itemId: string) {
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
