import type { AccentVariant } from '@/lib/types';
import { layoutTokens } from '@/theme/tokens';

export const accentTokens = {
  terracotta: {
    accent: 'oklch(0.62 0.13 38)',
    accentSoft: 'oklch(0.94 0.04 38)',
    accentInk: 'oklch(0.45 0.13 38)',
  },
  sage: {
    accent: 'oklch(0.55 0.09 150)',
    accentSoft: 'oklch(0.94 0.03 150)',
    accentInk: 'oklch(0.38 0.10 150)',
  },
  plum: {
    accent: 'oklch(0.48 0.12 340)',
    accentSoft: 'oklch(0.94 0.03 340)',
    accentInk: 'oklch(0.36 0.14 340)',
  },
} as const;

export function buildTheme(accent: AccentVariant = 'terracotta', fontVars?: { serif: string; sans: string; mono: string }) {
  const a = accentTokens[accent];
  return {
    colors: {
      bg: '#FAF6F0',
      bgElev: '#FFFDF8',
      bgSunk: '#F2EBDD',
      ink: '#2A2622',
      inkSoft: '#5C5249',
      muted: '#8A7E72',
      hair: '#E8DFD2',
      hairStrong: '#D8CDB8',
      accent: a.accent,
      accentSoft: a.accentSoft,
      accentInk: a.accentInk,
      danger: 'oklch(0.55 0.14 28)',
    },
    fonts: {
      serif: fontVars?.serif ?? `'Fraunces', 'Cormorant Garamond', Georgia, serif`,
      sans: fontVars?.sans ?? `'Inter', system-ui, sans-serif`,
      mono: fontVars?.mono ?? `'JetBrains Mono', ui-monospace, monospace`,
    },
    radii: { sm: '4px', md: '8px', lg: '14px' },
    shadows: {
      sm: '0 1px 2px rgba(50, 35, 20, 0.04)',
      md: '0 4px 18px -8px rgba(50, 35, 20, 0.10), 0 1px 2px rgba(50, 35, 20, 0.04)',
      lg: '0 18px 40px -20px rgba(50, 35, 20, 0.18), 0 2px 6px rgba(50, 35, 20, 0.05)',
    },
    layout: { maxWidth: layoutTokens.maxWidth },
    transitions: { fast: '160ms', med: '240ms' },
  } as const;
}

export type AppTheme = ReturnType<typeof buildTheme>;
