import type { RecipeType } from '@/lib/types';

export const RECIPE_TYPES: Array<{ value: RecipeType; label: string }> = [
  { value: 'starter',  label: 'Starter'  },
  { value: 'main',     label: 'Main'     },
  { value: 'dessert',  label: 'Dessert'  },
  { value: 'italian',  label: 'Italian'  },
  { value: 'asian',    label: 'Asian'    },
];

export const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  RECIPE_TYPES.map(t => [t.value, t.label])
);

export const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'az',      label: 'A → Z'        },
  { value: 'za',      label: 'Z → A'        },
];
