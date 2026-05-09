export type RecipeType = 'starter' | 'main' | 'dessert' | 'italian' | 'asian';

export interface Ingredient {
  id: number;
  amount: string;
  name: string;
}

export interface Step {
  id: number;
  order: number;
  description: string;
}

export interface Recipe {
  id: number;
  uid: string;
  title: string;
  types: RecipeType[];
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes: string;
  createdAt: string;
}

export interface ShoppingItem {
  id: number;
  recipeId: number;
  recipeUid: string;
  recipeTitle: string;
  ingredientId: number;
  name: string;
  amount: string;
  checked: boolean;
  addedAt: string;
}

export type AccentVariant = 'terracotta' | 'sage' | 'plum';

export interface Tweaks {
  accent: AccentVariant;
  titleScale: number;
}
