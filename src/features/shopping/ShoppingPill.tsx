'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { css } from 'styled-components';
import { IconBasket } from '@/components/icons/Icon';

interface PillProps {
  $hasItems: boolean;
  $isActive: boolean;
}

const Pill = styled(Link)<PillProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hairStrong};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-decoration: none;

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.colors.muted};
    transition: color ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.ink};
    color: ${({ theme }) => theme.colors.ink};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    svg { color: ${({ theme }) => theme.colors.accentInk}; }
  }

  ${({ $hasItems, theme }) => $hasItems && css`
    border-color: ${theme.colors.accent};
    color: ${theme.colors.accentInk};
    background: ${theme.colors.accentSoft};
    svg { color: ${theme.colors.accentInk}; }
  `}

  ${({ $isActive, theme }) => $isActive && css`
    background: ${theme.colors.ink};
    color: ${theme.colors.bg};
    border-color: ${theme.colors.ink};
    svg { color: ${theme.colors.bg}; }
  `}
`;

const Label = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

interface CountBadgeProps {
  $hasItems: boolean;
  $isActive: boolean;
}

const CountBadge = styled.span<CountBadgeProps>`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgSunk};
  color: ${({ theme }) => theme.colors.muted};
  transition: all ${({ theme }) => theme.transitions.fast};

  ${({ $hasItems, theme }) => $hasItems && css`
    background: ${theme.colors.accent};
    color: #fff;
  `}

  ${({ $isActive }) => $isActive && css`
    background: rgba(255, 255, 255, 0.18);
    color: inherit;
  `}
`;

export default function ShoppingPill({ count }: { count: number }) {
  const pathname = usePathname();
  const isActive = pathname === '/shopping';
  const hasItems = count > 0;

  return (
    <Pill href="/shopping" $hasItems={hasItems} $isActive={isActive} aria-label="Open shopping list">
      <IconBasket />
      <Label>Shopping list</Label>
      <CountBadge $hasItems={hasItems} $isActive={isActive}>{count}</CountBadge>
    </Pill>
  );
}
