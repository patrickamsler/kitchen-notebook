import 'server-only';
import fs from 'fs';
import path from 'path';
import type { Recipe, ShoppingItem } from '@/lib/types';
import { SEED_RECIPES } from '@/lib/seed';

const DATA_FILE = path.join(process.cwd(), '.data', 'store.json');

interface StoreData {
  recipes: Recipe[];
  shopping: ShoppingItem[];
}

let _store: StoreData | null = null;

function readFromDisk(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as StoreData;
    }
  } catch {}
  return { recipes: SEED_RECIPES, shopping: [] };
}

function writeToDisk(data: StoreData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {}
}

function getStore(): StoreData {
  if (!_store) {
    _store = readFromDisk();
  }
  return _store;
}

function saveStore() {
  if (_store) writeToDisk(_store);
}

const delay = () => new Promise<void>(r => setTimeout(r, 120));

export async function getRecipes(): Promise<Recipe[]> {
  await delay();
  return [...getStore().recipes];
}

export async function getRecipe(id: string): Promise<Recipe> {
  await delay();
  const recipe = getStore().recipes.find(r => r.id === id);
  if (!recipe) throw new Error('Recipe not found');
  return { ...recipe };
}

export async function createRecipe(recipe: Recipe): Promise<void> {
  await delay();
  const store = getStore();
  store.recipes = [recipe, ...store.recipes];
  saveStore();
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await delay();
  const store = getStore();
  const idx = store.recipes.findIndex(r => r.id === recipe.id);
  if (idx < 0) throw new Error('Recipe not found');
  store.recipes[idx] = recipe;
  saveStore();
}

export async function deleteRecipe(id: string): Promise<void> {
  await delay();
  const store = getStore();
  store.recipes = store.recipes.filter(r => r.id !== id);
  store.shopping = store.shopping.filter(s => s.recipeId !== id);
  saveStore();
}

export async function getShopping(): Promise<ShoppingItem[]> {
  await delay();
  return [...getStore().shopping];
}

export async function addShoppingItems(items: ShoppingItem[]): Promise<void> {
  await delay();
  const store = getStore();
  const existingKeys = new Set(store.shopping.map(it => `${it.recipeId}::${it.ingredientId}`));
  const fresh = items.filter(it => !existingKeys.has(`${it.recipeId}::${it.ingredientId}`));
  store.shopping = [...store.shopping, ...fresh];
  saveStore();
}

export async function toggleShoppingItem(itemId: string): Promise<void> {
  await delay();
  const store = getStore();
  store.shopping = store.shopping.map(it =>
    it.id === itemId ? { ...it, checked: !it.checked } : it
  );
  saveStore();
}

export async function removeShoppingItem(itemId: string): Promise<void> {
  await delay();
  const store = getStore();
  store.shopping = store.shopping.filter(it => it.id !== itemId);
  saveStore();
}

export async function removeShoppingByIngredient(recipeId: string, ingredientId: string): Promise<void> {
  await delay();
  const store = getStore();
  store.shopping = store.shopping.filter(
    it => !(it.recipeId === recipeId && it.ingredientId === ingredientId)
  );
  saveStore();
}

export async function clearCheckedShopping(): Promise<void> {
  await delay();
  const store = getStore();
  store.shopping = store.shopping.filter(it => !it.checked);
  saveStore();
}

export async function clearAllShopping(): Promise<void> {
  await delay();
  const store = getStore();
  store.shopping = [];
  saveStore();
}
