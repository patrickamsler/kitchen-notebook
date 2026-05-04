'use client';

import Link from 'next/link';
import styled from 'styled-components';
import type { Recipe, RecipeType } from '@/lib/types';
import RecipeCard from './RecipeCard';
import FilterBar from './FilterBar';
import SearchBar from './SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconPlus, IconArrowRight } from '@/components/icons/Icon';

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-bottom: 36px;
  align-items: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const NewLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: 8px;
  border: 1px solid #2A2622;
  background: #2A2622;
  color: #FAF6F0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all 160ms;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    background: oklch(0.45 0.13 38);
    border-color: oklch(0.45 0.13 38);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 18px -8px rgba(50,35,20,0.10), 0 1px 2px rgba(50,35,20,0.04);
  }
`;

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
      <Toolbar>
        <SearchBar value={query} count={filtered.length} total={recipes.length} />
        <NewLink href="/recipes/new">
          <IconPlus /> New recipe
        </NewLink>
      </Toolbar>

      <FilterBar activeTypes={activeTypes} sort={sort} counts={counts} />

      {filtered.length === 0 ? (
        <EmptyState>
          <h3>{hasFilters ? 'Nothing matches those filters.' : 'Your shelf is empty.'}</h3>
          <p>{hasFilters ? 'Try a different word, or clear the filters.' : 'Add your first recipe to get started.'}</p>
          {hasFilters ? (
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button as="span">Clear all filters</Button>
            </Link>
          ) : (
            <Link href="/recipes/new" style={{ textDecoration: 'none' }}>
              <Button $variant="accent" as="span"><IconPlus /> Add a recipe</Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <Grid>
          {filtered.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={recipes.findIndex(x => x.id === r.id)} />
          ))}
        </Grid>
      )}
    </div>
  );
}
