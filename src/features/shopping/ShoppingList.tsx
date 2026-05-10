'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import styles from './ShoppingList.module.scss';
import type { ShoppingItem } from '@/lib/types';
import { IconArrowLeft, IconArrowRight, IconTrash } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import ShoppingItemRow from './ShoppingItemRow';
import { clearCheckedShoppingAction, clearAllShoppingAction } from '@/app/actions/shopping';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

interface Group {
  recipeId: number;
  recipeUid: string;
  title: string;
  items: ShoppingItem[];
}

interface Props {
  items: ShoppingItem[];
  isAuthenticated: boolean;
}

export default function ShoppingList({ items, isAuthenticated }: Props) {
  const [, startTransition] = useTransition();
  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  const remaining = total - checked;

  const groups: Group[] = [];
  const seen = new Map<number, ShoppingItem[]>();
  for (const item of items) {
    if (!seen.has(item.recipeId)) seen.set(item.recipeId, []);
    seen.get(item.recipeId)!.push(item);
  }
  for (const [recipeId, groupItems] of seen) {
    groups.push({
      recipeId,
      recipeUid: groupItems[0].recipeUid,
      title: groupItems[0].recipeTitle || 'Removed recipe',
      items: groupItems,
    });
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleClearChecked = () => {
    startTransition(() => { clearCheckedShoppingAction(); });
  };

  const handleClearAll = () => {
    if (!confirm('Empty your shopping list?')) return;
    startTransition(() => { clearAllShoppingAction(); });
  };

  return (
    <div className={styles.shopping}>
      <div className={styles.backRow}>
        <Link href="/" className={styles.backLink}><IconArrowLeft /> All recipes</Link>
        {isAuthenticated && total > 0 && (
          <div className={styles.actions}>
            {checked > 0 && (
              <Button $variant="ghost" onClick={handleClearChecked}>
                Clear {checked} checked
              </Button>
            )}
            <Button $variant="danger" onClick={handleClearAll}>
              <IconTrash /> Empty list
            </Button>
          </div>
        )}
      </div>

      <header className={styles.hero}>
        <div className={styles.eyebrow}>The market list · {todayStr}</div>
        <h1 className={styles.title}>Shopping<br />list</h1>
        {total > 0 ? (
          <p className={styles.tally}>
            <span className={styles.tallyNum}>{remaining}</span>
            <span className={styles.tallyLbl}>to buy</span>
            {checked > 0 && (
              <>
                <span className={styles.tallySep}>·</span>
                <span className={cx(styles.tallyNum, styles.tallyNumSoft)}>{checked}</span>
                <span className={styles.tallyLbl}>in the basket</span>
              </>
            )}
            <span className={styles.tallySep}>·</span>
            <span className={cx(styles.tallyNum, styles.tallyNumSoft)}>{groups.length}</span>
            <span className={styles.tallyLbl}>{groups.length === 1 ? 'recipe' : 'recipes'}</span>
          </p>
        ) : (
          <p className={styles.emptyDesc}>Nothing here yet — open a recipe and tap the ingredients you need to pick up.</p>
        )}
      </header>

      {total === 0 ? (
        <EmptyState style={{ marginTop: 24 }}>
          <h3>Your basket is empty.</h3>
          <p>Pick a recipe, select ingredients, and they&apos;ll land here.</p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button $variant="accent">Browse recipes <IconArrowRight /></Button>
          </Link>
        </EmptyState>
      ) : (
        <div className={styles.body}>
          {groups.map(group => (
            <section key={group.recipeId}>
              <header className={styles.groupHead}>
                <div className={styles.groupMeta}>From the recipe</div>
                <Link href={`/recipes/${group.recipeUid}`} className={styles.groupTitle}>
                  {group.title} <IconArrowRight />
                </Link>
                <span className={styles.groupCount}>{group.items.length} {group.items.length === 1 ? 'item' : 'items'}</span>
              </header>
              <ul className={styles.list}>
                {group.items.map(item => (
                  <ShoppingItemRow key={item.id} item={item} isAuthenticated={isAuthenticated} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
