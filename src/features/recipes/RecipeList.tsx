'use client';

import Link from 'next/link';
import styles from './RecipeList.module.scss';
import type { Recipe, RecipeType } from '@/lib/types';
import RecipeCard from './RecipeCard';
import FilterBar from './FilterBar';
import SearchBar from './SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconPlus, IconArrowRight } from '@/components/icons/Icon';

interface Props {
  recipes: Recipe[];
  filtered: Recipe[];
  activeTypes: RecipeType[];
  sort: string;
  query: string;
  counts: Record<string, number>;
}

export default function RecipeList({ recipes, filtered, activeTypes, sort, query, counts }: Props) {
  const hasFilters = activeTypes.length > 0 || query.trim().length > 0;

  return (
    <div>
      <div className={styles.toolbar}>
        <SearchBar value={query} count={filtered.length} total={recipes.length} />
        <Link href="/recipes/new" className={styles.newLink}>
          <IconPlus /> New recipe
        </Link>
      </div>

      <FilterBar activeTypes={activeTypes} sort={sort} counts={counts} />

      {filtered.length === 0 ? (
        <EmptyState>
          <h3>{hasFilters ? 'Nothing matches those filters.' : 'Your shelf is empty.'}</h3>
          <p>{hasFilters ? 'Try a different word, or clear the filters.' : 'Add your first recipe to get started.'}</p>
          {hasFilters ? (
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button>Clear all filters</Button>
            </Link>
          ) : (
            <Link href="/recipes/new" style={{ textDecoration: 'none' }}>
              <Button $variant="accent"><IconPlus /> Add a recipe</Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className={styles.grid}>
          {filtered.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={recipes.findIndex(x => x.id === r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
