import { Suspense } from 'react';
import { getRecipes } from '@/data/store';
import RecipeList from '@/features/recipes/RecipeList';
import type { Recipe, RecipeType } from '@/lib/types';

function filterAndSort(
  recipes: Recipe[],
  query: string,
  types: RecipeType[],
  sort: string
): { filtered: Recipe[]; counts: Record<string, number> } {
  const q = query.trim().toLowerCase();
  const searched = q ? recipes.filter(r => r.title.toLowerCase().includes(q)) : recipes;

  const counts: Record<string, number> = { __all: searched.length };
  for (const r of searched) {
    for (const t of r.types) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }

  let list = types.length > 0
    ? searched.filter(r => r.types.some(t => types.includes(t)))
    : searched;

  const sorted = [...list];
  switch (sort) {
    case 'oldest': sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
    case 'az': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'za': sorted.sort((a, b) => b.title.localeCompare(a.title)); break;
    default: sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return { filtered: sorted, counts };
}

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; sort?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q ?? '';
  const activeTypes = params.type ? (params.type.split(',') as RecipeType[]) : [];
  const sort = params.sort ?? 'newest';

  const recipes = await getRecipes();
  const { filtered, counts } = filterAndSort(recipes, query, activeTypes, sort);

  return (
    <Suspense>
      <RecipeList
        recipes={recipes}
        filtered={filtered}
        activeTypes={activeTypes}
        sort={sort}
        query={query}
        counts={counts}
      />
    </Suspense>
  );
}
