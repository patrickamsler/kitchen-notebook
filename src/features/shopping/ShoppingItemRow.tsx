'use client';

import { useOptimistic, useTransition } from 'react';
import styled from 'styled-components';
import type { ShoppingItem } from '@/lib/types';
import { IconCheck, IconX } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/Button';
import { toggleShoppingItemAction, removeShoppingItemAction } from '@/app/actions/shopping';

interface RowProps {
  $checked: boolean;
}

const Row = styled.li<RowProps>`
  display: grid;
  grid-template-columns: 22px 1fr auto 32px;
  gap: 14px;
  align-items: baseline;
  padding: 14px 4px;
  border-bottom: 1px dotted ${({ theme }) => theme.colors.hairStrong};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  opacity: ${({ $checked }) => $checked ? 0.7 : 1};
`;

interface CheckBoxProps {
  $checked: boolean;
}

const CheckBox = styled.button<CheckBoxProps>`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${({ $checked, theme }) => $checked ? theme.colors.accent : theme.colors.hairStrong};
  border-radius: 4px;
  background: ${({ $checked, theme }) => $checked ? theme.colors.accent : theme.colors.bgElev};
  transition: all ${({ theme }) => theme.transitions.fast};
  align-self: center;
  flex: 0 0 18px;
  padding: 0;
  cursor: pointer;

  &:hover { border-color: ${({ theme }) => theme.colors.ink}; }

  svg { color: #fff; }
`;

interface NameProps {
  $checked: boolean;
}

const Name = styled.span<NameProps>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 17px;
  font-weight: 350;
  font-variation-settings: 'opsz' 14;
  color: ${({ $checked, theme }) => $checked ? theme.colors.muted : theme.colors.ink};
  text-decoration: ${({ $checked }) => $checked ? 'line-through' : 'none'};
  text-decoration-color: ${({ theme }) => theme.colors.hairStrong};
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.fast};
`;

interface AmountProps {
  $checked: boolean;
}

const Amount = styled.span<AmountProps>`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.05em;
  color: ${({ $checked, theme }) => $checked ? theme.colors.muted : theme.colors.accentInk};
  white-space: nowrap;
  text-decoration: ${({ $checked }) => $checked ? 'line-through' : 'none'};
  text-decoration-color: ${({ theme }) => theme.colors.hairStrong};
  transition: color ${({ theme }) => theme.transitions.fast};
`;

const RemoveBtn = styled(IconButton)`
  opacity: 0;
  width: 28px;
  height: 28px;
  align-self: center;
  transition: opacity ${({ theme }) => theme.transitions.fast},
              background ${({ theme }) => theme.transitions.fast},
              color ${({ theme }) => theme.transitions.fast};

  ${Row}:hover & { opacity: 1; }
  &:hover { background: ${({ theme }) => theme.colors.bgSunk}; color: ${({ theme }) => theme.colors.danger}; }

  @media (max-width: 720px) { opacity: 1; }
`;

export default function ShoppingItemRow({ item }: { item: ShoppingItem }) {
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(item.checked);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      setOptimisticChecked(!optimisticChecked);
      toggleShoppingItemAction(item.id);
    });
  };

  const handleRemove = () => {
    startTransition(() => {
      removeShoppingItemAction(item.id);
    });
  };

  return (
    <Row $checked={optimisticChecked}>
      <CheckBox
        type="button"
        $checked={optimisticChecked}
        onClick={handleToggle}
        aria-label={optimisticChecked ? 'Mark as not bought' : 'Mark as bought'}
      >
        {optimisticChecked && <IconCheck />}
      </CheckBox>
      <Name $checked={optimisticChecked} onClick={handleToggle}>{item.name}</Name>
      <Amount $checked={optimisticChecked}>{item.amount || '—'}</Amount>
      <RemoveBtn type="button" onClick={handleRemove} aria-label="Remove">
        <IconX />
      </RemoveBtn>
    </Row>
  );
}
