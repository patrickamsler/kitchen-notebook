'use client';

import styled, { css } from 'styled-components';

type Variant = 'default' | 'primary' | 'accent' | 'ghost' | 'danger';

interface BtnProps {
  $variant?: Variant;
  $pending?: boolean;
}

export const Button = styled.button<BtnProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.hairStrong};
  background: ${({ theme }) => theme.colors.bgElev};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.ink};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  ${({ $variant, theme }) => $variant === 'primary' && css`
    background: ${theme.colors.ink};
    color: ${theme.colors.bg};
    border-color: ${theme.colors.ink};
    &:hover:not(:disabled) { background: ${theme.colors.accentInk}; border-color: ${theme.colors.accentInk}; color: #fff; }
  `}

  ${({ $variant, theme }) => $variant === 'accent' && css`
    background: ${theme.colors.accent};
    color: #fff;
    border-color: ${theme.colors.accent};
    &:hover:not(:disabled) { background: ${theme.colors.accentInk}; border-color: ${theme.colors.accentInk}; }
  `}

  ${({ $variant, theme }) => $variant === 'ghost' && css`
    background: transparent;
    border-color: transparent;
    color: ${theme.colors.inkSoft};
    &:hover:not(:disabled) { background: ${theme.colors.bgSunk}; border-color: ${theme.colors.hair}; color: ${theme.colors.ink}; transform: none; box-shadow: none; }
  `}

  ${({ $variant, theme }) => $variant === 'danger' && css`
    background: transparent;
    color: ${theme.colors.danger};
    border-color: ${theme.colors.hairStrong};
    &:hover:not(:disabled) { background: ${theme.colors.danger}; color: #fff; border-color: ${theme.colors.danger}; }
  `}
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.colors.inkSoft};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.bgSunk}; color: ${({ theme }) => theme.colors.ink}; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  svg { width: 16px; height: 16px; }
`;
