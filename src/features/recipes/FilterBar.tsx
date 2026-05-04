'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styled from 'styled-components';
import { IconCaret } from '@/components/icons/Icon';
import { RECIPE_TYPES, SORT_OPTIONS } from './constants';
import type { RecipeType } from '@/lib/types';

const Bar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin: -8px 0 32px;
  padding: 18px 0 22px;
  border-top: 1px dotted ${({ theme }) => theme.colors.hairStrong};
  border-bottom: 1px dotted ${({ theme }) => theme.colors.hairStrong};
  flex-wrap: wrap;

  @media (max-width: 720px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
`;

const SortRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;

  @media (max-width: 720px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Label = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  flex: 0 0 auto;
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

interface ChipProps {
  $active: boolean;
  $empty: boolean;
}

const Chip = styled.button<ChipProps>`
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.ink : theme.colors.hairStrong};
  background: ${({ $active, theme }) => $active ? theme.colors.ink : theme.colors.bgElev};
  color: ${({ $active, theme }) => $active ? theme.colors.bg : theme.colors.inkSoft};
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 350;
  font-size: 14px;
  font-variation-settings: 'opsz' 14;
  letter-spacing: 0.005em;
  transition: all ${({ theme }) => theme.transitions.fast};
  line-height: 1.2;
  opacity: ${({ $empty, $active }) => ($empty && !$active) ? 0.45 : 1};
  cursor: ${({ $empty, $active }) => ($empty && !$active) ? 'not-allowed' : 'pointer'};

  &:hover:not(:disabled) {
    color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.ink};
    border-color: ${({ $active, theme }) => $active ? theme.colors.accentInk : theme.colors.ink};
    background: ${({ $active, theme }) => $active ? theme.colors.accentInk : theme.colors.bgElev};
  }
`;

const ChipCount = styled.span<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10px;
  letter-spacing: 0.05em;
  color: ${({ $active }) => $active ? 'rgba(255,255,255,0.7)' : 'inherit'};
  font-variation-settings: normal;
  opacity: ${({ $active }) => $active ? 1 : 0.7};
`;

const SelectWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const SortSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hairStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 32px 8px 14px;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 350;
  font-size: 14px;
  font-variation-settings: 'opsz' 14;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast};
  line-height: 1.2;

  &:hover { border-color: ${({ theme }) => theme.colors.ink}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentSoft};
  }
`;

const CaretWrap = styled.span`
  position: absolute;
  right: 12px;
  width: 12px;
  height: 12px;
  color: ${({ theme }) => theme.colors.muted};
  pointer-events: none;
`;

interface Props {
  activeTypes: RecipeType[];
  sort: string;
  counts: Record<string, number>;
}

export default function FilterBar({ activeTypes, sort, counts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleType = (type: RecipeType) => {
    const current = new Set(activeTypes);
    current.has(type) ? current.delete(type) : current.add(type);
    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set('type', Array.from(current).join(','));
    } else {
      params.delete('type');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearTypes = () => setParam('type', null);

  return (
    <Bar>
      <FilterRow>
        <Label>Filter</Label>
        <ChipList role="group" aria-label="Filter by recipe type">
          <Chip
            $active={activeTypes.length === 0}
            $empty={false}
            onClick={clearTypes}
            type="button"
          >
            All <ChipCount $active={activeTypes.length === 0}>{counts.__all ?? 0}</ChipCount>
          </Chip>
          {RECIPE_TYPES.map(t => {
            const c = counts[t.value] ?? 0;
            const active = activeTypes.includes(t.value);
            return (
              <Chip
                key={t.value}
                $active={active}
                $empty={c === 0 && !active}
                onClick={() => toggleType(t.value)}
                type="button"
                disabled={c === 0 && !active}
              >
                {t.label} <ChipCount $active={active}>{c}</ChipCount>
              </Chip>
            );
          })}
        </ChipList>
      </FilterRow>
      <SortRow>
        <Label as="label" htmlFor="sort-select">Sort</Label>
        <SelectWrap>
          <SortSelect
            id="sort-select"
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </SortSelect>
          <CaretWrap><IconCaret /></CaretWrap>
        </SelectWrap>
      </SortRow>
    </Bar>
  );
}
