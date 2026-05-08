'use client';

import React from 'react';
import { TweaksProvider } from './TweaksProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TweaksProvider>
      {children}
    </TweaksProvider>
  );
}
