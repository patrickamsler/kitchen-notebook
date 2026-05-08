'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SettingsMenu.module.scss';
import { useTweaks } from '@/providers/TweaksProvider';
import type { AccentVariant } from '@/lib/types';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

const accents: Array<{ value: AccentVariant; label: string; color: string }> = [
  { value: 'terracotta', label: 'Terra', color: 'oklch(0.62 0.13 38)' },
  { value: 'sage', label: 'Sage', color: 'oklch(0.55 0.09 150)' },
  { value: 'plum', label: 'Plum', color: 'oklch(0.48 0.12 340)' },
];

export default function SettingsMenu() {
  const { tweaks, setTweak } = useTweaks();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(o => !o)}>Settings</button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Accent</div>
            <div className={styles.accentRow}>
              {accents.map(a => (
                <button
                  key={a.value}
                  className={cx(styles.swatch, tweaks.accent === a.value && styles.swatchActive)}
                  style={{ background: a.color }}
                  onClick={() => setTweak('accent', a.value)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Title scale</div>
            <div className={styles.sliderWrap}>
              <div className={styles.sliderRow}>
                <input
                  className={styles.slider}
                  type="range"
                  min={0.7}
                  max={1.3}
                  step={0.05}
                  value={tweaks.titleScale}
                  onChange={e => setTweak('titleScale', parseFloat(e.target.value))}
                />
                <span className={styles.sliderVal}>{tweaks.titleScale.toFixed(2)}×</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
