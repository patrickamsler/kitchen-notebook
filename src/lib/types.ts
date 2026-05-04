export type RecipeType = 'starter' | 'main' | 'dessert' | 'italian' | 'asian';

export interface Ingredient {
  id: string;
  amount: string;
  name: string;
}

export interface Step {
  id: string;
  order: number;
  description: string;
}

export interface Recipe {
  id: string;
  title: string;
  types: RecipeType[];
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes: string;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  recipeId: string;
  recipeTitle: string;
  ingredientId: string;
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
