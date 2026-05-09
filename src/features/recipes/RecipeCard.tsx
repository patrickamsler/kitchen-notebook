'use client';

import Link from 'next/link';
import styles from './RecipeCard.module.scss';
import type { Recipe } from '@/lib/types';
import { IconArrowRight } from '@/components/icons/Icon';
import { TYPE_LABEL } from './constants';

interface Props {
  recipe: Recipe;
  index: number;
}

export default function RecipeCard({ recipe, index }: Props) {
  const created = new Date(recipe.createdAt);
  const month = created.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = created.getDate();
  const year = created.getFullYear();
  const num = String(index + 1).padStart(2, '0');

  return (
    <Link href={`/recipes/${recipe.uid}`} className={styles.card}>
      <div className={styles.cardMeta}>
        <span>№ {num}</span>
        {recipe.types.length > 0 && (
          <span className={styles.cardTypes}>
            {recipe.types.map(t => (
              <span key={t} className={styles.typeBadge}>{TYPE_LABEL[t] ?? t}</span>
            ))}
          </span>
        )}
      </div>
      <h2 className={styles.title}>{recipe.title}</h2>
      <p className={styles.desc}>{recipe.description}</p>
      <div className={styles.foot}>
        <span>{month} {day} · {year}</span>
        <span className={styles.stats}>{recipe.ingredients.length} ingr · {recipe.steps.length} steps</span>
        <span className={styles.open}>Open <span className={styles.arrow}><IconArrowRight /></span></span>
      </div>
    </Link>
  );
}
