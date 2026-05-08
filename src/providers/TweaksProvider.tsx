'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AccentVariant, Tweaks } from '@/lib/types';

const STORAGE_KEY = 'kitchen-notebook::tweaks::v1';

const defaults: Tweaks = { accent: 'terracotta', titleScale: 1.0 };

interface TweaksCtx {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
}

const TweaksContext = createContext<TweaksCtx>({
  tweaks: defaults,
  setTweak: () => {},
});

export function useTweaks() {
  return useContext(TweaksContext);
}

export function TweaksProvider({ children }: { children: React.ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(defaults);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Tweaks>;
        setTweaks(prev => ({ ...prev, ...parsed }));
      }
    } catch {}
    setMounted(true);
  }, []);

  // Persist tweaks to localStorage
  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks)); } catch {}
    }
  }, [tweaks, mounted]);

  // Sync accent to data-accent attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', tweaks.accent);
  }, [tweaks.accent]);

  // Sync titleScale to CSS variable on <html>
  useEffect(() => {
    document.documentElement.style.setProperty('--title-scale', String(tweaks.titleScale));
  }, [tweaks.titleScale]);

  const setTweak = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks(prev => ({ ...prev, [key]: value }));
  };

  return (
    <TweaksContext.Provider value={{ tweaks, setTweak }}>
      {children}
    </TweaksContext.Provider>
  );
}
