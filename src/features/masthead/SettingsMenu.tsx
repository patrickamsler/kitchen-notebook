'use client';

import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTweaks } from '@/providers/TweaksProvider';
import type { AccentVariant } from '@/lib/types';

const Wrap = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 6px 10px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
    border-color: ${({ theme }) => theme.colors.hairStrong};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 16px;
  z-index: 100;
  animation: fadeSlide 160ms ease-out;
`;

const SectionTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 10px;
`;

const Section = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const AccentRow = styled.div`
  display: flex;
  gap: 8px;
`;

interface SwatchProps {
  $active: boolean;
  $color: string;
}

const Swatch = styled.button<SwatchProps>`
  flex: 1;
  padding: 7px 4px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.ink : theme.colors.hair};
  background: ${({ $color }) => $color};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover { transform: translateY(-1px); box-shadow: ${({ theme }) => theme.shadows.sm}; }
`;

const SliderWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Slider = styled.input`
  flex: 1;
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const SliderVal = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.muted};
  min-width: 28px;
  text-align: right;
`;

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
    <Wrap ref={ref}>
      <Trigger onClick={() => setOpen(o => !o)}>Settings</Trigger>
      {open && (
        <Dropdown>
          <Section>
            <SectionTitle>Accent</SectionTitle>
            <AccentRow>
              {accents.map(a => (
                <Swatch
                  key={a.value}
                  $active={tweaks.accent === a.value}
                  $color={a.color}
                  onClick={() => setTweak('accent', a.value)}
                >
                  {a.label}
                </Swatch>
              ))}
            </AccentRow>
          </Section>
          <Section>
            <SectionTitle>Title scale</SectionTitle>
            <SliderWrap>
              <SliderRow>
                <Slider
                  type="range"
                  min={0.7}
                  max={1.3}
                  step={0.05}
                  value={tweaks.titleScale}
                  onChange={e => setTweak('titleScale', parseFloat(e.target.value))}
                />
                <SliderVal>{tweaks.titleScale.toFixed(2)}×</SliderVal>
              </SliderRow>
            </SliderWrap>
          </Section>
        </Dropdown>
      )}
    </Wrap>
  );
}
