'use client';

import Link from 'next/link';
import styles from './MastheadShell.module.scss';
import ShoppingPill from '@/features/shopping/ShoppingPill';
import UserMenu from '@/features/auth/UserMenu';

interface Props {
  pendingCount: number;
  totalCount: number;
  lastDate: string;
  userEmail: string | null;
}

export default function MastheadShell({ pendingCount, totalCount, lastDate, userEmail }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.eyebrow}>Vol. 01 · Personal Edition</span>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 className={styles.wordmark}>
            The <em>Kitchen</em><br />Notebook
          </h1>
        </Link>
      </div>
      <div className={styles.meta}>
        <ShoppingPill count={pendingCount} />
        <span>
          {totalCount} {totalCount === 1 ? 'recipe' : 'recipes'} · Last edit {lastDate}
        </span>
        <UserMenu email={userEmail} />
      </div>
    </header>
  );
}
