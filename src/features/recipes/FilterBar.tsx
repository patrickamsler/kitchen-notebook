'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './FilterBar.module.scss';
import { IconCaret } from '@/components/icons/Icon';
import { RECIPE_TYPES, SORT_OPTIONS } from './constants';
import type { RecipeType } from '@/lib/types';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

interface Props {
  activeTypes: RecipeType[];
  sort: string;
  counts: Record<string, number>;
}

export default function FilterBar({ activeTypes, sort, counts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleType = (type: RecipeType) => {
    const current = new Set(activeTypes);
    current.has(type) ? current.delete(type) : current.add(type);
    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set('type', Array.from(current).join(','));
    } else {
      params.delete('type');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearTypes = () => setParam('type', null);

  return (
    <div className={styles.bar}>
      <div className={styles.filterRow}>
        <span className={styles.label}>Filter</span>
        <div className={styles.chipList} role="group" aria-label="Filter by recipe type">
          <button
            className={cx(styles.chip, activeTypes.length === 0 && styles.chipActive)}
            onClick={clearTypes}
            type="button"
          >
            All{' '}
            <span className={cx(styles.chipCount, activeTypes.length === 0 && styles.chipCountActive)}>
              {counts.__all ?? 0}
            </span>
          </button>
          {RECIPE_TYPES.map(t => {
            const c = counts[t.value] ?? 0;
            const active = activeTypes.includes(t.value);
            const empty = c === 0 && !active;
            return (
              <button
                key={t.value}
                className={cx(
                  styles.chip,
                  active && styles.chipActive,
                  empty && styles.chipEmpty,
                )}
                onClick={() => toggleType(t.value)}
                type="button"
                disabled={empty}
              >
                {t.label}{' '}
                <span className={cx(styles.chipCount, active && styles.chipCountActive)}>{c}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.sortRow}>
        <label className={styles.label} htmlFor="sort-select">Sort</label>
        <div className={styles.selectWrap}>
          <select
            id="sort-select"
            className={styles.sortSelect}
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className={styles.caretWrap}><IconCaret /></span>
        </div>
      </div>
    </div>
  );
}
