'use client';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '@/theme/GlobalStyle';
import { buildTheme } from '@/theme/theme';
import { TweaksProvider, useTweaks } from './TweaksProvider';
import StyledComponentsRegistry from './StyledComponentsRegistry';

function ThemedApp({ children, fontVars }: { children: React.ReactNode; fontVars: { serif: string; sans: string; mono: string } }) {
  const { tweaks } = useTweaks();
  const theme = buildTheme(tweaks.accent, fontVars);
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}

export function Providers({
  children,
  fontVars,
}: {
  children: React.ReactNode;
  fontVars: { serif: string; sans: string; mono: string };
}) {
  return (
    <StyledComponentsRegistry>
      <TweaksProvider>
        <ThemedApp fontVars={fontVars}>{children}</ThemedApp>
      </TweaksProvider>
    </StyledComponentsRegistry>
  );
}
