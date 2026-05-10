'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import styles from './UserMenu.module.scss';
import { logoutAction } from '@/app/actions/auth';

interface Props {
  email: string | null;
}

export default function UserMenu({ email }: Props) {
  const [pending, startTransition] = useTransition();

  if (!email) {
    return (
      <Link href="/login" className={styles.signIn}>
        Sign in
      </Link>
    );
  }

  return (
    <div className={styles.menu}>
      <span className={styles.email} title={email}>{email}</span>
      <button
        type="button"
        className={styles.signOut}
        disabled={pending}
        onClick={() => startTransition(() => { logoutAction(); })}
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
