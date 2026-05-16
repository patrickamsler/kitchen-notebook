'use client';

import Link from 'next/link';
import styles from './MastheadShell.module.scss';
import ShoppingPill from '@/features/shopping/ShoppingPill';
import UserMenu from '@/features/auth/UserMenu';

interface Props {
  pendingCount: number;
  userEmail: string | null;
  userName: string | null;
}

export default function MastheadShell({ pendingCount, userEmail, userName }: Props) {
  const isLoggedIn = !!userEmail;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className={styles.wordmark}>
            The <em>Kitchen</em> Notebook
          </span>
        </Link>
        <span className={styles.divider} aria-hidden>|</span>
        <span className={styles.eyebrow}>Vol. 01 · Personal</span>
      </div>
      <div className={styles.actions}>
        {isLoggedIn && <ShoppingPill count={pendingCount} />}
        <UserMenu email={userEmail} name={userName} />
      </div>
    </header>
  );
}
