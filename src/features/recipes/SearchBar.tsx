'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './SearchBar.module.scss';
import { IconSearch } from '@/components/icons/Icon';

interface Props {
  value: string;
  count: number;
  total: number;
}

export default function SearchBar({ value, count, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  return (
    <div className={styles.wrap}>
      <span className={styles.searchIcon}><IconSearch /></span>
      <input
        type="text"
        className={styles.input}
        placeholder="Search recipes by title…"
        defaultValue={value}
        onChange={handleChange}
        autoComplete="off"
        spellCheck={false}
      />
      {value && <span className={styles.count}>{count} / {total}</span>}
    </div>
  );
}
