'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import styles from './LoginForm.module.scss';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { IconArrowLeft } from '@/components/icons/Icon';

interface Props {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAction({ email, password, redirectTo });
      if (res?.serverError || res?.validationErrors) {
        setError('Invalid email or password.');
      }
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.backRow}>
        <Link href="/" className={styles.backLink}>
          <IconArrowLeft /> Back to recipes
        </Link>
      </div>

      <header className={styles.header}>
        <div className={styles.eyebrow}>The kitchen door</div>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lede}>
          Browsing is open to anyone. Sign in to add, edit, or remove recipes and shopping items.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            disabled={pending}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.input}
            disabled={pending}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" $variant="accent" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>
    </div>
  );
}
