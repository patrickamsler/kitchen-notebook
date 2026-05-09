'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import styles from './RecipeDetailClient.module.scss';
import type { Recipe, ShoppingItem } from '@/lib/types';
import { TYPE_LABEL } from './constants';
import {
  IconArrowLeft, IconEdit, IconTrash, IconPlus, IconCheck, IconX, IconArrowRight
} from '@/components/icons/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { deleteRecipeAction } from '@/app/actions/recipes';
import { addShoppingItemsAction, removeShoppingByIngredientAction } from '@/app/actions/shopping';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

function parseNotes(notes: string): string[] {
  const items = notes
    .split(/\n+|(?:^|\s)[•\-–]\s+/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (items.length <= 1) {
    return notes
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return items;
}

interface Props {
  recipe: Recipe;
  shoppingItems: ShoppingItem[];
}

export default function RecipeDetailClient({ recipe, shoppingItems }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [checkedIngs, setCheckedIngs] = useState<Set<number>>(new Set());
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState<{ kind: 'add' | 'remove' } | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const onListKeys = new Set(
    shoppingItems.map(it => `${it.recipeId}::${it.ingredientId}`)
  );

  const toggleIngChecked = (id: number) => {
    setCheckedIngs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStep = (id: number) => {
    setDoneSteps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleShopping = (ing: { id: number; name: string; amount: string }) => {
    const onList = onListKeys.has(`${recipe.id}::${ing.id}`);
    startTransition(() => {
      if (onList) {
        removeShoppingByIngredientAction({ recipeId: recipe.id, recipeUid: recipe.uid, ingredientId: ing.id });
        setFlash({ kind: 'remove' });
      } else {
        addShoppingItemsAction({ recipeId: recipe.id, recipeUid: recipe.uid, recipeTitle: recipe.title, ingredients: [ing] });
        setFlash({ kind: 'add' });
      }
    });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1800);
  };

  const handleDelete = () => {
    startTransition(() => { deleteRecipeAction({ id: recipe.id }); });
  };

  const created = new Date(recipe.createdAt);
  const dateStr = created.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const types = recipe.types ?? [];

  return (
    <div className={styles.detail}>
      <div className={styles.backRow}>
        <Link href="/" className={styles.backLink}>
          <IconArrowLeft /> All recipes
        </Link>
        <div className={styles.actions}>
          {confirming ? (
            <div className={styles.confirmBar}>
              <span className={styles.confirmLabel}>Delete this recipe?</span>
              <Button $variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button $variant="danger" onClick={handleDelete}>Yes, delete</Button>
            </div>
          ) : (
            <>
              <Button $variant="ghost" onClick={() => setConfirming(true)}>
                <IconTrash /> Delete
              </Button>
              <Link href={`/recipes/${recipe.uid}/edit`} style={{ textDecoration: 'none' }}>
                <Button><IconEdit /> Edit</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <header className={styles.hero}>
        <div className={styles.eyebrow}>
          From the kitchen · Saved {dateStr}
          {types.length > 0 && (
            <> · <span className={styles.detailType}>{types.map(t => TYPE_LABEL[t] ?? t).join(' · ')}</span></>
          )}
        </div>
        <h1 className={styles.title}>{recipe.title}</h1>
        <p className={styles.desc}>{recipe.description}</p>
      </header>

      <div className={styles.body}>
        <aside className={styles.ingredientsAside}>
          <div className={styles.ingredientsHead}>
            <h3 className={styles.sectionLabel}>Ingredients</h3>
          </div>
          <ul className={styles.ingList}>
            {recipe.ingredients.map(ing => {
              const checked = checkedIngs.has(ing.id);
              const onList = onListKeys.has(`${recipe.id}::${ing.id}`);
              return (
                <li
                  key={ing.id}
                  className={styles.ingRow}
                  onClick={() => toggleIngChecked(ing.id)}
                >
                  <span className={cx(styles.ingName, checked && styles.ingNameChecked)}>{ing.name}</span>
                  <span className={cx(styles.ingAmount, checked && styles.ingAmountChecked)}>{ing.amount}</span>
                  <button
                    type="button"
                    className={cx(styles.quickAdd, onList && styles.quickAddOnList)}
                    onClick={e => { e.stopPropagation(); toggleShopping(ing); }}
                    aria-label={onList ? 'Remove from shopping list' : 'Add to shopping list'}
                  >
                    {onList ? <IconCheck /> : <IconPlus />}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.ingHint}>
            {flash?.kind === 'add' ? (
              <span className={styles.toast}><IconCheck /> Added to your shopping list</span>
            ) : flash?.kind === 'remove' ? (
              <span className={cx(styles.toast, styles.toastRemove)}><IconX /> Removed from your shopping list</span>
            ) : (
              <>Tap a row to check it off · Tap <span className={styles.hintGlyph}>+</span> to add to your shopping list</>
            )}
          </p>
        </aside>

        <div>
          <h3 className={styles.sectionLabel}>Method</h3>
          <ol className={styles.stepsList}>
            {[...recipe.steps].sort((a, b) => a.order - b.order).map(step => {
              const done = doneSteps.has(step.id);
              return (
                <li
                  key={step.id}
                  className={cx(styles.stepItem, done && styles.stepItemDone)}
                  onClick={() => toggleStep(step.id)}
                >
                  <span className={styles.stepNum}>{String(step.order).padStart(2, '0')}</span>
                  <span className={cx(styles.stepText, done && styles.stepTextDone)}>{step.description}</span>
                </li>
              );
            })}
          </ol>

          {recipe.notes?.trim() && (
            <section className={styles.notesSection}>
              <h3 className={styles.notesSectionLabel}>Notes from the cook</h3>
              <ul className={styles.notesList}>
                {parseNotes(recipe.notes).map((s, i) => (
                  <li key={i} className={styles.noteItem}>{s}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
