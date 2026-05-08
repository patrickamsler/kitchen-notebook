'use client';

import { useOptimistic, useTransition } from 'react';
import styles from './ShoppingItemRow.module.scss';
import type { ShoppingItem } from '@/lib/types';
import { IconCheck, IconX } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/Button';
import { toggleShoppingItemAction, removeShoppingItemAction } from '@/app/actions/shopping';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

export default function ShoppingItemRow({ item }: { item: ShoppingItem }) {
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(item.checked);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      setOptimisticChecked(!optimisticChecked);
      toggleShoppingItemAction(item.id);
    });
  };

  const handleRemove = () => {
    startTransition(() => {
      removeShoppingItemAction(item.id);
    });
  };

  return (
    <li className={cx(styles.row, optimisticChecked && styles.rowChecked)}>
      <button
        type="button"
        className={cx(styles.checkBox, optimisticChecked && styles.checkBoxChecked)}
        onClick={handleToggle}
        aria-label={optimisticChecked ? 'Mark as not bought' : 'Mark as bought'}
      >
        {optimisticChecked && <IconCheck />}
      </button>
      <span
        className={cx(styles.name, optimisticChecked && styles.nameChecked)}
        onClick={handleToggle}
      >
        {item.name}
      </span>
      <span className={cx(styles.amount, optimisticChecked && styles.amountChecked)}>
        {item.amount || '—'}
      </span>
      <IconButton
        type="button"
        className={styles.removeBtn}
        onClick={handleRemove}
        aria-label="Remove"
      >
        <IconX />
      </IconButton>
    </li>
  );
}
