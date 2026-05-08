'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ShoppingPill.module.scss';
import { IconBasket } from '@/components/icons/Icon';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

export default function ShoppingPill({ count }: { count: number }) {
  const pathname = usePathname();
  const isActive = pathname === '/shopping';
  const hasItems = count > 0;

  return (
    <Link
      href="/shopping"
      className={cx(
        styles.pill,
        hasItems && styles.pillHasItems,
        isActive && styles.pillActive,
      )}
      aria-label="Open shopping list"
    >
      <IconBasket />
      <span className={styles.label}>Shopping list</span>
      <span className={cx(
        styles.badge,
        hasItems && styles.badgeHasItems,
        isActive && styles.badgeActive,
      )}>
        {count}
      </span>
    </Link>
  );
}
