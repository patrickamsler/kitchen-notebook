import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { RecipeType, Ingredient, Step } from '@/lib/types';

type RecipeUpdate = {
  title: string;
  description: string;
  notes: string;
  types: RecipeType[];
  ingredients: Ingredient[];
  steps: Step[];
};

type ShoppingInsert = {
  recipeId: number;
  recipeUid: string;
  recipeTitle: string;
  ingredientId: number;
  name: string;
  amount: string;
  checked: boolean;
};

export async function createRecipe(data: RecipeUpdate): Promise<string> {
  const supabase = createClient();

  const { data: row, error } = await supabase
    .from('recipes')
    .insert({ title: data.title, description: data.description, notes: data.notes })
    .select('id, uid')
    .single();
  if (error) throw new Error(error.message);
  const recipeId: number = (row as { id: number; uid: string }).id;
  const recipeUid: string = (row as { id: number; uid: string }).uid;

  if (data.types.length > 0) {
    const { error: e } = await supabase
      .from('recipe_types')
      .insert(data.types.map(t => ({ recipe_id: recipeId, type_id: t })));
    if (e) throw new Error(e.message);
  }

  if (data.ingredients.length > 0) {
    const { error: e } = await supabase
      .from('ingredients')
      .insert(data.ingredients.map(i => ({ recipe_id: recipeId, amount: i.amount, name: i.name })));
    if (e) throw new Error(e.message);
  }

  if (data.steps.length > 0) {
    const { error: e } = await supabase
      .from('steps')
      .insert(data.steps.map(s => ({ recipe_id: recipeId, order: s.order, description: s.description })));
    if (e) throw new Error(e.message);
  }

  return recipeUid;
}

export async function updateRecipe(id: number, data: RecipeUpdate): Promise<void> {
  const supabase = createClient();

  const { error: recipeErr } = await supabase
    .from('recipes')
    .update({ title: data.title, description: data.description, notes: data.notes })
    .eq('id', id);
  if (recipeErr) throw new Error(recipeErr.message);

  // recipe_types: full replace (no other table references these)
  await supabase.from('recipe_types').delete().eq('recipe_id', id);
  if (data.types.length > 0) {
    await supabase
      .from('recipe_types')
      .insert(data.types.map(t => ({ recipe_id: id, type_id: t })));
  }

  // Ingredients: diff to preserve IDs referenced by shopping_items
  const { data: existingIngs } = await supabase
    .from('ingredients')
    .select('id')
    .eq('recipe_id', id);
  const existingIngIds = new Set((existingIngs ?? []).map((r: { id: number }) => r.id));
  const submittedIngIds = new Set(data.ingredients.filter(i => i.id > 0).map(i => i.id));

  const ingIdsToDelete = [...existingIngIds].filter(ingId => !submittedIngIds.has(ingId));
  if (ingIdsToDelete.length > 0) {
    await supabase.from('shopping_items').delete().in('ingredient_id', ingIdsToDelete);
    await supabase.from('ingredients').delete().in('id', ingIdsToDelete);
  }
  for (const ing of data.ingredients.filter(i => i.id > 0)) {
    await supabase.from('ingredients').update({ amount: ing.amount, name: ing.name }).eq('id', ing.id);
  }
  const newIngs = data.ingredients.filter(i => i.id === 0);
  if (newIngs.length > 0) {
    await supabase
      .from('ingredients')
      .insert(newIngs.map(i => ({ recipe_id: id, amount: i.amount, name: i.name })));
  }

  // Steps: same diff (no FK dependents)
  const { data: existingSteps } = await supabase
    .from('steps')
    .select('id')
    .eq('recipe_id', id);
  const existingStepIds = new Set((existingSteps ?? []).map((r: { id: number }) => r.id));
  const submittedStepIds = new Set(data.steps.filter(s => s.id > 0).map(s => s.id));

  const stepIdsToDelete = [...existingStepIds].filter(sId => !submittedStepIds.has(sId));
  if (stepIdsToDelete.length > 0) {
    await supabase.from('steps').delete().in('id', stepIdsToDelete);
  }
  for (const step of data.steps.filter(s => s.id > 0)) {
    await supabase
      .from('steps')
      .update({ order: step.order, description: step.description })
      .eq('id', step.id);
  }
  const newSteps = data.steps.filter(s => s.id === 0);
  if (newSteps.length > 0) {
    await supabase
      .from('steps')
      .insert(newSteps.map(s => ({ recipe_id: id, order: s.order, description: s.description })));
  }
}

export async function deleteRecipe(id: number): Promise<void> {
  const supabase = createClient();
  await supabase.from('shopping_items').delete().eq('recipe_id', id);
  await supabase.from('steps').delete().eq('recipe_id', id);
  await supabase.from('ingredients').delete().eq('recipe_id', id);
  await supabase.from('recipe_types').delete().eq('recipe_id', id);
  await supabase.from('recipes').delete().eq('id', id);
}

export async function addShoppingItems(items: ShoppingInsert[]): Promise<void> {
  if (items.length === 0) return;
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('shopping_items')
    .select('recipe_id, ingredient_id')
    .in('ingredient_id', items.map(i => i.ingredientId));

  const existingKeys = new Set(
    (existing ?? []).map((e: { recipe_id: number; ingredient_id: number }) =>
      `${e.recipe_id}::${e.ingredient_id}`
    )
  );

  const fresh = items.filter(i => !existingKeys.has(`${i.recipeId}::${i.ingredientId}`));
  if (fresh.length === 0) return;

  await supabase.from('shopping_items').insert(
    fresh.map(i => ({
      recipe_id: i.recipeId,
      recipe_uid: i.recipeUid,
      recipe_title: i.recipeTitle,
      ingredient_id: i.ingredientId,
      name: i.name,
      amount: i.amount,
      checked: false,
    }))
  );
}

export async function toggleShoppingItem(itemId: number): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase
    .from('shopping_items')
    .select('checked')
    .eq('id', itemId)
    .single();
  await supabase
    .from('shopping_items')
    .update({ checked: !(data as { checked: boolean }).checked })
    .eq('id', itemId);
}

export async function removeShoppingItem(itemId: number): Promise<void> {
  const supabase = createClient();
  await supabase.from('shopping_items').delete().eq('id', itemId);
}

export async function removeShoppingByIngredient(recipeId: number, ingredientId: number): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('shopping_items')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('ingredient_id', ingredientId);
}

export async function clearCheckedShopping(): Promise<void> {
  const supabase = createClient();
  await supabase.from('shopping_items').delete().eq('checked', true);
}

export async function clearAllShopping(): Promise<void> {
  const supabase = createClient();
  await supabase.from('shopping_items').delete().gt('id', 0);
}
