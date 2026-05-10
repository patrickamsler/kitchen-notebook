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

      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>Members&rsquo; Entrance</div>
          <h1 className={styles.title}>Log <em>in</em></h1>
          <p className={styles.lede}>
            Your recipes and shopping list live here — sign in to get cooking.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@kitchen.com"
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
            <Button type="submit" $variant="primary" className={styles.submitBtn} disabled={pending}>
              {pending ? 'Signing in…' : 'Log in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
