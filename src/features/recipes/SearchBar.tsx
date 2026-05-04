'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styled from 'styled-components';
import { IconSearch } from '@/components/icons/Icon';

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 16px 14px 44px;
  font-size: 15px;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast},
              background ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  font-family: ${({ theme }) => theme.fonts.serif};
  font-variation-settings: 'opsz' 14;

  &::placeholder { color: ${({ theme }) => theme.colors.muted}; font-style: italic; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentSoft};
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.muted};
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const Count = styled.span`
  position: absolute;
  right: 14px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0.05em;
`;

interface Props {
  value: string;
  count: number;
  total: number;
}

export default function SearchBar({ value, count, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  return (
    <Wrap>
      <SearchIcon><IconSearch /></SearchIcon>
      <Input
        type="text"
        placeholder="Search recipes by title…"
        defaultValue={value}
        onChange={handleChange}
        autoComplete="off"
        spellCheck={false}
      />
      {value && <Count>{count} / {total}</Count>}
    </Wrap>
  );
}
