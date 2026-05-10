'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import styles from './UserMenu.module.scss';
import { logoutAction } from '@/app/actions/auth';

interface Props {
  email: string | null;
  name: string | null;
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="6" r="4" />
      <path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3" />
      <path d="M13 14l4-4-4-4" />
      <path d="M17 10H7" />
    </svg>
  );
}

export default function UserMenu({ email, name }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Use capture so the handler runs before the trigger's onClick can re-open
    document.addEventListener('click', handleOutside, true);
    return () => document.removeEventListener('click', handleOutside, true);
  }, [open]);

  if (!email) {
    return (
      <Link href="/login" className={styles.signIn}>
        <PersonIcon />
        LOG IN
      </Link>
    );
  }

  const initial = (name ?? email).charAt(0).toUpperCase();

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className={styles.avatar}>{initial}</span>
        <span className={styles.displayName}>{name ?? email.split('@')[0]}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.dropName}>{name ?? email.split('@')[0]}</p>
          <p className={styles.dropEmail}>{email}</p>
          <div className={styles.dropDivider} />
          <button
            type="button"
            className={styles.dropSignOut}
            disabled={pending}
            onClick={() => startTransition(() => { logoutAction(); })}
          >
            <SignOutIcon />
            {pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
