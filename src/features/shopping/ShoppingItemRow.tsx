'use client';

import { useOptimistic, useTransition } from 'react';
import styles from './ShoppingItemRow.module.scss';
import type { ShoppingItem } from '@/lib/types';
import { IconCheck, IconX } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/Button';
import { toggleShoppingItemAction, removeShoppingItemAction } from '@/app/actions/shopping';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

interface Props {
  item: ShoppingItem;
  isAuthenticated: boolean;
}

export default function ShoppingItemRow({ item, isAuthenticated }: Props) {
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(item.checked);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    if (!isAuthenticated) return;
    startTransition(() => {
      setOptimisticChecked(!optimisticChecked);
      toggleShoppingItemAction({ id: item.id });
    });
  };

  const handleRemove = () => {
    startTransition(() => {
      removeShoppingItemAction({ id: item.id });
    });
  };

  return (
    <li className={cx(styles.row, optimisticChecked && styles.rowChecked)}>
      {isAuthenticated ? (
        <button
          type="button"
          className={cx(styles.checkBox, optimisticChecked && styles.checkBoxChecked)}
          onClick={handleToggle}
          aria-label={optimisticChecked ? 'Mark as not bought' : 'Mark as bought'}
        >
          {optimisticChecked && <IconCheck />}
        </button>
      ) : (
        <span
          className={cx(styles.checkBox, optimisticChecked && styles.checkBoxChecked)}
          aria-hidden="true"
        >
          {optimisticChecked && <IconCheck />}
        </span>
      )}
      <span
        className={cx(styles.name, optimisticChecked && styles.nameChecked)}
        onClick={handleToggle}
      >
        {item.name}
      </span>
      <span className={cx(styles.amount, optimisticChecked && styles.amountChecked)}>
        {item.amount || '—'}
      </span>
      {isAuthenticated && (
        <IconButton
          type="button"
          className={styles.removeBtn}
          onClick={handleRemove}
          aria-label="Remove"
        >
          <IconX />
        </IconButton>
      )}
    </li>
  );
}
